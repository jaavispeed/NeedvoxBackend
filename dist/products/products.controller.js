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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const pagination_dto_1 = require("../common/dtos/pagination.dto");
const decorators_1 = require("../auth/decorators");
const user_entity_1 = require("../auth/entities/user.entity");
const lotes_service_1 = require("../lotes/lotes.service");
let ProductsController = class ProductsController {
    constructor(productsService, lotesService) {
        this.productsService = productsService;
        this.lotesService = lotesService;
    }
    async create(createProductDto, user) {
        console.log('Intentando crear producto con:', createProductDto);
        try {
            const product = await this.productsService.create(createProductDto, user);
            return product;
        }
        catch (error) {
            console.error('Error al crear producto:', error);
            if (error.message.includes('Nombre ya creado')) {
                throw new common_1.ConflictException('El nombre del producto ya existe.');
            }
            else if (error.message.includes('Código de barras ya creado')) {
                throw new common_1.ConflictException('El código de barras ya existe.');
            }
            throw new common_1.BadRequestException('Error al crear el producto. Verifica los datos ingresados.');
        }
    }
    findAll(paginationDto, user) {
        return this.productsService.findAll(paginationDto, user);
    }
    findAllAdmin(paginationDto) {
        return this.productsService.findAllAdmin(paginationDto);
    }
    async findOne(term, user) {
        return await this.productsService.findOne(term, user);
    }
    async update(id, updateProductDto, user) {
        try {
            const product = await this.productsService.update(id, updateProductDto, user);
            return product;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            if (error.message.includes('Nombre ya creado')) {
                throw new common_1.ConflictException('El nombre del producto ya existe.');
            }
            else if (error.message.includes('Código de barras ya creado')) {
                throw new common_1.ConflictException('El código de barras ya existe.');
            }
            throw new common_1.BadRequestException('Error al actualizar el producto. Verifica los datos ingresados.');
        }
    }
    async remove(id, user) {
        const deletedProduct = await this.productsService.remove(id, user);
        if (!deletedProduct) {
            throw new common_1.NotFoundException('Producto no encontrado.');
        }
        return {
            message: 'Producto eliminado con éxito.',
            id: deletedProduct.id,
        };
    }
    async findByName(name, user) {
        return await this.productsService.findByName(name, user);
    }
    async countProductsByUser(userId) {
        const count = await this.productsService.countByUser(userId);
        return count;
    }
    async findAllByProduct(productId, user) {
        console.log(`Buscando lotes para el producto: ${productId} y usuario: ${user.id}`);
        const lotes = await this.lotesService.findAllByProduct(productId, user);
        const stockTotal = lotes.reduce((total, lote) => total + lote.stock, 0);
        console.log(`Stock total calculado para el producto ${productId}: ${stockTotal}`);
        console.log(`Lotes encontrados para el producto ${productId}:`, lotes);
        await this.productsService.update(productId, { stockTotal }, user);
        return { lotes, stockTotal };
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, decorators_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('/productAdmin'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)(':term'),
    __param(0, (0, common_1.Param)('term')),
    __param(1, (0, decorators_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('name/:name'),
    __param(0, (0, common_1.Param)('name')),
    __param(1, (0, decorators_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findByName", null);
__decorate([
    (0, common_1.Get)('count/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "countProductsByUser", null);
__decorate([
    (0, common_1.Get)('producto/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findAllByProduct", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    (0, decorators_1.Auth)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService, lotes_service_1.LotesService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map