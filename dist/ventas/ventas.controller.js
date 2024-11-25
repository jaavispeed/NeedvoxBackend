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
exports.VentasController = void 0;
const common_1 = require("@nestjs/common");
const create_venta_dto_1 = require("./dto/create-venta.dto");
const ventas_service_1 = require("./ventas.service");
const decorators_1 = require("../auth/decorators");
const update_venta_dto_1 = require("./dto/update-venta.dto");
const productventa_service_1 = require("./productventa.service");
let VentasController = class VentasController {
    constructor(ventasService, productVentaService) {
        this.ventasService = ventasService;
        this.productVentaService = productVentaService;
    }
    async obtenerResumenVentas(req) {
        const user = req.user;
        return await this.ventasService.obtenerResumenVentas(user);
    }
    async create(createVentaDto, req) {
        const user = req.user;
        return this.ventasService.create(createVentaDto, user);
    }
    async update(id, updateVentaDto, req) {
        const user = req.user;
        return this.ventasService.update(id, updateVentaDto, user);
    }
    async remove(id, req) {
        const user = req.user;
        return this.ventasService.remove(id, user);
    }
    async findByDate(date, req) {
        const user = req.user;
        console.log('Usuario autenticado:', user);
        return await this.ventasService.findByDate(date, user);
    }
    async findByMetodoPago(metodoPago, req) {
        const user = req.user;
        return await this.ventasService.findByMetodoPago(metodoPago, user);
    }
    async findAll(req) {
        const user = req.user;
        return await this.ventasService.findAll(user);
    }
    async obtenerTodos() {
        return this.productVentaService.obtenerTodos();
    }
    async obtenerPorId(id) {
        return this.productVentaService.obtenerPorId(id);
    }
};
exports.VentasController = VentasController;
__decorate([
    (0, common_1.Get)('resumen'),
    (0, decorators_1.Auth)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "obtenerResumenVentas", null);
__decorate([
    (0, decorators_1.Auth)(),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_venta_dto_1.CreateVentaDto, Object]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "create", null);
__decorate([
    (0, decorators_1.Auth)(),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_venta_dto_1.UpdateVentaDto, Object]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "update", null);
__decorate([
    (0, decorators_1.Auth)(),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('fecha/:date'),
    (0, decorators_1.Auth)(),
    __param(0, (0, common_1.Param)('date')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "findByDate", null);
__decorate([
    (0, common_1.Get)('metodo_pago/:metodoPago'),
    (0, decorators_1.Auth)(),
    __param(0, (0, common_1.Param)('metodoPago')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "findByMetodoPago", null);
__decorate([
    (0, decorators_1.Auth)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('product-venta'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "obtenerTodos", null);
__decorate([
    (0, common_1.Get)('product-venta/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "obtenerPorId", null);
exports.VentasController = VentasController = __decorate([
    (0, common_1.Controller)('ventas'),
    (0, decorators_1.Auth)(),
    __metadata("design:paramtypes", [ventas_service_1.VentasService,
        productventa_service_1.ProductventaService])
], VentasController);
//# sourceMappingURL=ventas.controller.js.map