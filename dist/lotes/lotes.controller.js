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
exports.LotesController = void 0;
const common_1 = require("@nestjs/common");
const lotes_service_1 = require("./lotes.service");
const create_lote_dto_1 = require("./dto/create-lote.dto");
const update_lote_dto_1 = require("./dto/update-lote.dto");
const user_entity_1 = require("../auth/entities/user.entity");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const pagination_dto_1 = require("../common/dtos/pagination.dto");
const decorators_1 = require("../auth/decorators");
const products_service_1 = require("../products/products.service");
let LotesController = class LotesController {
    constructor(lotesService, productsService) {
        this.lotesService = lotesService;
        this.productsService = productsService;
    }
    async obtenerEstadisticas(user, tipo) {
        return this.lotesService.obtenerEstadisticas(user, tipo);
    }
    async create(createLoteDto, user) {
        return this.lotesService.create(createLoteDto, user);
    }
    async findAll(paginationDto, user) {
        return this.lotesService.findAll(paginationDto, user);
    }
    async findOne(id, user) {
        return this.lotesService.findOne(id, user);
    }
    async update(id, updateLoteDto, user) {
        return this.lotesService.update(id, updateLoteDto, user);
    }
    async remove(id, user) {
        return this.lotesService.remove(id, user);
    }
    async findAllByUser(user) {
        return this.lotesService.findAllByUser(user);
    }
    async findAllByProduct(productId, user) {
        console.log(`Buscando lotes para el producto: ${productId} y usuario: ${user.id}`);
        const lotes = await this.lotesService.findAllByProduct(productId, user);
        const stockTotal = lotes.reduce((total, lote) => total + lote.stock, 0);
        console.log(`Stock total calculado para el producto ${productId}: ${stockTotal}`);
        console.log(`Lotes encontrados para el producto ${productId}:`, lotes);
        return { lotes, stockTotal };
    }
};
exports.LotesController = LotesController;
__decorate([
    (0, common_1.Get)('estadisticas'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('tipo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "obtenerEstadisticas", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lote_dto_1.CreateLoteDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_lote_dto_1.UpdateLoteDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('user'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "findAllByUser", null);
__decorate([
    (0, common_1.Get)('producto/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "findAllByProduct", null);
exports.LotesController = LotesController = __decorate([
    (0, common_1.Controller)('lotes'),
    (0, decorators_1.Auth)(),
    __metadata("design:paramtypes", [lotes_service_1.LotesService, products_service_1.ProductsService])
], LotesController);
//# sourceMappingURL=lotes.controller.js.map