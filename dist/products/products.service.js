"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const uuid_1 = require("uuid");
const lotes_service_1 = require("../lotes/lotes.service");
const date_fns_tz_1 = require("date-fns-tz");
let ProductsService = class ProductsService {
    constructor(productRepository, lotesService) {
        this.productRepository = productRepository;
        this.lotesService = lotesService;
        this.logger = new common_1.Logger('ProductService');
    }
    async create(createProductDto, user) {
        try {
            const barcode = createProductDto.barcode?.trim() === '' || createProductDto.barcode === 'Sin código de barras' ? null : createProductDto.barcode;
            const existingProductWithTitle = await this.findByName(createProductDto.title, user);
            if (existingProductWithTitle) {
                throw new common_1.BadRequestException('Nombre ya creado para este usuario.');
            }
            if (barcode) {
                const existingProductWithBarcode = await this.findByBarcodeAndUser(barcode, user);
                if (existingProductWithBarcode) {
                    throw new common_1.BadRequestException('Código de barras ya creado para este usuario.');
                }
            }
            const currentDate = new Date();
            const chileTime = (0, date_fns_tz_1.toZonedTime)(currentDate, 'America/Santiago');
            const product = this.productRepository.create({
                ...createProductDto,
                barcode,
                user,
                fechaCreacion: chileTime,
            });
            await this.productRepository.save(product);
            return product;
        }
        catch (error) {
            this.handleDBExceptions(error);
        }
    }
    async findAll(paginationDto, user) {
        const { limit = 10, offset = 0 } = paginationDto;
        const products = await this.productRepository.find({
            where: { user },
            take: limit + 1,
            skip: offset,
            order: {
                fechaCreacion: 'DESC',
            },
        });
        const hasMore = products.length > limit;
        if (hasMore)
            products.pop();
        return {
            data: products,
            hasMore,
        };
    }
    async findOne(term, user) {
        let product;
        if ((0, uuid_1.validate)(term)) {
            product = await this.productRepository.findOne({ where: { id: term, user } });
        }
        else {
            const queryBuilder = this.productRepository.createQueryBuilder();
            product = await queryBuilder
                .where('UPPER(title) = :title OR slug = :slug OR barcode = :barcode', {
                title: term.toUpperCase(),
                slug: term.toLowerCase(),
                barcode: term,
            })
                .andWhere('user.id = :userId', { userId: user.id })
                .getOne();
        }
        if (!product) {
            throw new common_1.NotFoundException(`Producto con el término ${term} no encontrado.`);
        }
        return product;
    }
    async update(id, updateProductDto, user) {
        const barcode = updateProductDto.barcode?.trim() === '' || updateProductDto.barcode === 'Sin código de barras' ? null : updateProductDto.barcode;
        const product = await this.productRepository.preload({
            id: id,
            ...updateProductDto,
            barcode,
        });
        if (!product)
            throw new common_1.NotFoundException(`Producto con id: ${id} no encontrado.`);
        const existingProductWithTitle = await this.findByName(updateProductDto.title, user);
        if (existingProductWithTitle && existingProductWithTitle.id !== id) {
            throw new common_1.BadRequestException('Nombre ya creado para este usuario.');
        }
        if (barcode) {
            const existingProductWithBarcode = await this.findByBarcodeAndUser(barcode, user);
            if (existingProductWithBarcode && existingProductWithBarcode.id !== id) {
                throw new common_1.BadRequestException('Código de barras ya creado para este usuario.');
            }
        }
        const updatedProduct = await this.productRepository.save(product);
        const stockTotal = await this.calculateTotalStock(id, user);
        updatedProduct.stockTotal = stockTotal;
        return await this.productRepository.save(updatedProduct);
    }
    async calculateTotalStock(productId, user) {
        const lotes = await this.lotesService.findAllByProduct(productId, user);
        return lotes.reduce((total, lote) => total + lote.stock, 0);
    }
    async remove(id, user) {
        const product = await this.productRepository.findOne({ where: { id, user } });
        if (!product) {
            throw new common_1.NotFoundException('Producto no encontrado.');
        }
        const stockTotal = await this.calculateTotalStock(product.id, user);
        product.stockTotal = stockTotal;
        await this.productRepository.remove(product);
        return product;
    }
    handleDBExceptions(error) {
        if (error.code === '23505') {
            throw new common_1.BadRequestException(error.detail);
        }
        this.logger.error(error);
        throw new common_1.InternalServerErrorException('Unexpected error, check server logs');
    }
    async findByBarcodeAndUser(barcode, user) {
        return await this.productRepository.findOne({
            where: {
                barcode,
                user,
            },
        });
    }
    async findByName(title, user) {
        const lowerTitle = title.toLowerCase();
        return await this.productRepository
            .createQueryBuilder('product')
            .where('LOWER(product.title) = :title', { title: lowerTitle })
            .andWhere('product.user.id = :userId', { userId: user.id })
            .getOne();
    }
    async countByUser(userId) {
        const count = await this.productRepository.count({ where: { user: { id: userId } } });
        console.log(`Cantidad de productos para el usuario ${userId}: ${count}`);
        return count;
    }
    findAllAdmin(paginationDto) {
        const { limit = 10, offset = 0 } = paginationDto;
        return this.productRepository.find({
            take: limit,
            skip: offset,
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => lotes_service_1.LotesService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        lotes_service_1.LotesService])
], ProductsService);
//# sourceMappingURL=products.service.js.map