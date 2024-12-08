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
exports.ProductVenta = exports.Venta = void 0;
const user_entity_1 = require("../../auth/entities/user.entity");
const lotes_entity_1 = require("../../lotes/entities/lotes.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const typeorm_1 = require("typeorm");
let Venta = class Venta {
};
exports.Venta = Venta;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Venta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Venta.prototype, "cantidadTotal", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', {
        default: 0
    }),
    __metadata("design:type", Number)
], Venta.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp', { default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Venta.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.id),
    __metadata("design:type", user_entity_1.User)
], Venta.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProductVenta, (productVenta) => productVenta.venta),
    __metadata("design:type", Array)
], Venta.prototype, "productos", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', { enum: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO'], default: 'OTRO' }),
    __metadata("design:type", String)
], Venta.prototype, "metodo_pago", void 0);
exports.Venta = Venta = __decorate([
    (0, typeorm_1.Entity)()
], Venta);
let ProductVenta = class ProductVenta {
};
exports.ProductVenta = ProductVenta;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProductVenta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], ProductVenta.prototype, "cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric'),
    __metadata("design:type", Number)
], ProductVenta.prototype, "ventaPrice", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, (product) => product.id),
    __metadata("design:type", product_entity_1.Product)
], ProductVenta.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Venta, (venta) => venta.productos, { nullable: false, onDelete: 'CASCADE' }),
    __metadata("design:type", Venta)
], ProductVenta.prototype, "venta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lotes_entity_1.Lote, (lote) => lote.id),
    __metadata("design:type", lotes_entity_1.Lote)
], ProductVenta.prototype, "lote", void 0);
exports.ProductVenta = ProductVenta = __decorate([
    (0, typeorm_1.Entity)()
], ProductVenta);
//# sourceMappingURL=ventas.entity.js.map