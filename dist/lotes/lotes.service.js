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
        const lote = this.loteRepository.create({
            ...createLoteDto,
            producto: product,
            user,
        });
        const savedLote = await this.loteRepository.save(lote);
        const stockTotal = await this.productsService.calculateTotalStock(product.id, user);
        product.stockTotal = stockTotal;
        await this.productRepository.save(product);
        return savedLote;
    }
    async findAll(paginationDto, user) {
        const { limit = 10, offset = 0 } = paginationDto;
        return await this.loteRepository.find({
            where: { user },
            take: limit,
            skip: offset,
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
        const updatedLote = await this.loteRepository.save({
            ...lote,
            ...updateLoteDto,
        });
        if (!lote.producto) {
            throw new common_1.NotFoundException('El lote no tiene un producto asociado.');
        }
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
        });
        console.log(`Lotes obtenidos en findAllByProductAndUser para producto ${productId}:`, lotes);
        return lotes;
    }
    async findAllByProduct(productId, user) {
        console.log(`Buscando lotes para productId: ${productId} y userId: ${user.id}`);
        try {
            const lotes = await this.loteRepository.find({
                where: { user, producto: { id: productId } },
            });
            console.log(`Lotes encontrados:`, lotes);
            return lotes;
        }
        catch (error) {
            console.error('Error al buscar lotes:', error);
            throw new Error('No se pudieron encontrar los lotes.');
        }
    }
    async obtenerEstadisticas(user, tipo) {
        try {
            let truncDate;
            let dateFilter;
            switch (tipo) {
                case 'mes':
                    truncDate = 'month';
                    dateFilter = "EXTRACT(YEAR FROM lote.fechaCreacion) = EXTRACT(YEAR FROM CURRENT_DATE)";
                    break;
                case 'año':
                    truncDate = 'year';
                    dateFilter = "EXTRACT(YEAR FROM lote.fechaCreacion) = EXTRACT(YEAR FROM CURRENT_DATE)";
                    break;
                case 'dia':
                default:
                    truncDate = 'day';
                    dateFilter = "DATE(lote.fechaCreacion) = CURRENT_DATE";
                    break;
            }
            const estadisticas = await this.loteRepository
                .createQueryBuilder('lote')
                .select([
                `DATE_TRUNC('${truncDate}', lote.fechaCreacion) AS fecha`,
                'SUM(lote.precioCompra) AS totalCompra'
            ])
                .where('lote.userId = :userId', { userId: user.id })
                .andWhere(dateFilter)
                .groupBy('fecha')
                .orderBy('fecha', 'DESC')
                .getRawMany();
            return { estadisticas };
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