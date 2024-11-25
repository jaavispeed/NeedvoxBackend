"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LotesModule = void 0;
const common_1 = require("@nestjs/common");
const lotes_controller_1 = require("./lotes.controller");
const lotes_service_1 = require("./lotes.service");
const lotes_entity_1 = require("./entities/lotes.entity");
const product_entity_1 = require("../products/entities/product.entity");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("../auth/auth.module");
const products_module_1 = require("../products/products.module");
let LotesModule = class LotesModule {
};
exports.LotesModule = LotesModule;
exports.LotesModule = LotesModule = __decorate([
    (0, common_1.Module)({
        controllers: [lotes_controller_1.LotesController],
        providers: [lotes_service_1.LotesService],
        imports: [
            auth_module_1.AuthModule,
            typeorm_1.TypeOrmModule.forFeature([lotes_entity_1.Lote, product_entity_1.Product]),
            (0, common_1.forwardRef)(() => products_module_1.ProductsModule),
        ],
        exports: [lotes_service_1.LotesService],
    })
], LotesModule);
//# sourceMappingURL=lotes.module.js.map