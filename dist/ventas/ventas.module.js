"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentasModule = void 0;
const common_1 = require("@nestjs/common");
const ventas_controller_1 = require("./ventas.controller");
const ventas_service_1 = require("./ventas.service");
const auth_module_1 = require("../auth/auth.module");
const typeorm_1 = require("@nestjs/typeorm");
const ventas_entity_1 = require("./entities/ventas.entity");
const product_entity_1 = require("../products/entities/product.entity");
const user_entity_1 = require("../auth/entities/user.entity");
const productventa_service_1 = require("./productventa.service");
const lotes_entity_1 = require("../lotes/entities/lotes.entity");
const products_module_1 = require("../products/products.module");
let VentasModule = class VentasModule {
};
exports.VentasModule = VentasModule;
exports.VentasModule = VentasModule = __decorate([
    (0, common_1.Module)({
        providers: [ventas_service_1.VentasService, productventa_service_1.ProductventaService],
        controllers: [ventas_controller_1.VentasController],
        imports: [
            auth_module_1.AuthModule,
            typeorm_1.TypeOrmModule.forFeature([ventas_entity_1.Venta, product_entity_1.Product, user_entity_1.User, ventas_entity_1.ProductVenta, lotes_entity_1.Lote]),
            products_module_1.ProductsModule
        ]
    })
], VentasModule);
//# sourceMappingURL=ventas.module.js.map