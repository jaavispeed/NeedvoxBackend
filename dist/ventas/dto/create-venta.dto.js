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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVentaDto = exports.CreateProductVentaDto = void 0;
const class_validator_1 = require("class-validator");
class CreateProductVentaDto {
}
exports.CreateProductVentaDto = CreateProductVentaDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateProductVentaDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateProductVentaDto.prototype, "cantidad", void 0);
__decorate([
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateProductVentaDto.prototype, "ventaPrice", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateProductVentaDto.prototype, "loteId", void 0);
class CreateVentaDto {
}
exports.CreateVentaDto = CreateVentaDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateVentaDto.prototype, "productos", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateVentaDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO']),
    __metadata("design:type", String)
], CreateVentaDto.prototype, "metodo_pago", void 0);
//# sourceMappingURL=create-venta.dto.js.map