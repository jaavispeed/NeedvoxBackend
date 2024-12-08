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
exports.LotesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lotes_entity_1 = require("./entities/lotes.entity");
const product_entity_1 = require("../products/entities/product.entity");
const products_service_1 = require("../products/products.service");
let LotesService = class LotesService {
    constructor(loteRepository, productRepository, productsService) {
        this.loteRepository = loteRepository;
        this.productRepository = productRepository;
        this.productsService = productsService;
        this.logger = new common_1.Logger('LotesService');
    }
    async create(createLoteDto, user) {
        const product = await this.productRepository.findOne({ where: { id: createLoteDto.productId } });
        if (!product) {
            throw new common_1.NotFoundException('Producto no encontrado.');
        }
        const fechaCaducidad = createLoteDto.fechaCaducidad || null;
        const lote = this.loteRepository.create({
            ...createLoteDto,
            fechaCaducidad,
            producto: product,
            user,
        });
        lote.precioCompra = createLoteDto.precioCompra;
        const savedLote = await this.loteRepository.save(lote);
        product.stockTotal = await this.productsService.calculateTotalStock(product.id, user);
        await this.productRepository.save(product);
        return savedLote;
    }
    async findAll(paginationDto, user) {
        return await this.loteRepository.find({
            where: { user },
            relations: ['producto'],
        });
    }
    async findOne(id, user) {
        const lote = await this.loteRepository.findOne({ where: { id, user } });
        if (!lote) {
            throw new common_1.NotFoundException('Lote no encontrado o no pertenece al usuario.');
        }
        return lote;
    }
    async update(id, updateLoteDto, user) {
        const lote = await this.loteRepository.findOne({ where: { id, user }, relations: ['producto'] });
        if (!lote) {
            throw new common_1.NotFoundException('Lote no encontrado.');
        }
        if (updateLoteDto.fechaCaducidad === null) {
            lote.fechaCaducidad = null;
        }
        else if (updateLoteDto.fechaCaducidad) {
            lote.fechaCaducidad = updateLoteDto.fechaCaducidad;
        }
        lote.precioCompra = updateLoteDto.precioCompra ?? lote.precioCompra;
        lote.stock = updateLoteDto.stock ?? lote.stock;
        const updatedLote = await this.loteRepository.save(lote);
        const product = lote.producto;
        product.stockTotal = await this.productsService.calculateTotalStock(product.id, user);
        await this.productRepository.save(product);
        return updatedLote;
    }
    async remove(id, user) {
        const lote = await this.loteRepository.findOne({
            where: { id, user },
            relations: ['producto']
        });
        if (!lote) {
            throw new common_1.NotFoundException('Lote no encontrado.');
        }
        if (!lote.producto) {
            throw new common_1.NotFoundException('El lote no tiene un producto asociado.');
        }
        await this.loteRepository.remove(lote);
        const product = lote.producto;
        product.stockTotal = await this.productsService.calculateTotalStock(product.id, user);
        await this.productRepository.save(product);
    }
    async findAllByUser(user) {
        return await this.loteRepository.find({ where: { user } });
    }
    async findAllByProductAndUser(productId, user) {
        const product = await this.productRepository.findOne({ where: { id: productId } });
        if (!product) {
            throw new common_1.NotFoundException('Producto no encontrado.');
        }
        const lotes = await this.loteRepository.find({
            where: {
                producto: product,
                user,
            },
            relations: ['producto'],
        });
        console.log(`Lotes obtenidos en findAllByProductAndUser para producto ${productId}:`, lotes);
        return lotes;
    }
    async findAllByProduct(productId, user) {
        console.log(`Buscando lotes para el producto con ID: ${productId}`);
        const lotes = await this.loteRepository.find({
            where: {
                producto: { id: productId },
                user: user,
            },
            relations: ['producto'],
        });
        console.log(`Lotes encontrados:`, lotes);
        return lotes;
    }
    async obtenerEstadisticas(user) {
        try {
            const gastosDia = await this.loteRepository
                .createQueryBuilder('lote')
                .select('SUM(lote.precioCompra)', 'totalCompra')
                .addSelect('COUNT(lote.id)', 'cantidad')
                .where('lote.userId = :userId', { userId: user.id })
                .andWhere("DATE(lote.fechaCreacion) = CURRENT_DATE")
                .getRawOne();
            const gastosMes = await this.loteRepository
                .createQueryBuilder('lote')
                .select('SUM(lote.precioCompra)', 'totalCompra')
                .addSelect('COUNT(lote.id)', 'cantidad')
                .where('lote.userId = :userId', { userId: user.id })
                .andWhere("EXTRACT(MONTH FROM lote.fechaCreacion) = EXTRACT(MONTH FROM CURRENT_DATE)")
                .andWhere("EXTRACT(YEAR FROM lote.fechaCreacion) = EXTRACT(YEAR FROM CURRENT_DATE)")
                .getRawOne();
            const gastosAnio = await this.loteRepository
                .createQueryBuilder('lote')
                .select('SUM(lote.precioCompra)', 'totalCompra')
                .addSelect('COUNT(lote.id)', 'cantidad')
                .where('lote.userId = :userId', { userId: user.id })
                .andWhere("EXTRACT(YEAR FROM lote.fechaCreacion) = EXTRACT(YEAR FROM CURRENT_DATE)")
                .getRawOne();
            return {
                gastosDia: {
                    totalCompra: gastosDia?.totalCompra || 0,
                    cantidad: gastosDia?.cantidad || 0,
                },
                gastosMes: {
                    totalCompra: gastosMes?.totalCompra || 0,
                    cantidad: gastosMes?.cantidad || 0,
                },
                gastosAnio: {
                    totalCompra: gastosAnio?.totalCompra || 0,
                    cantidad: gastosAnio?.cantidad || 0,
                },
            };
        }
        catch (error) {
            this.logger.error('Error al obtener estadísticas', error.stack);
            throw new Error('Error interno al calcular estadísticas.');
        }
    }
};
exports.LotesService = LotesService;
exports.LotesService = LotesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lotes_entity_1.Lote)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => products_service_1.ProductsService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        products_service_1.ProductsService])
], LotesService);
//# sourceMappingURL=lotes.service.js.map