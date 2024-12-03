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
exports.VentasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ventas_entity_1 = require("./entities/ventas.entity");
const product_entity_1 = require("../products/entities/product.entity");
const user_entity_1 = require("../auth/entities/user.entity");
const lotes_entity_1 = require("../lotes/entities/lotes.entity");
const products_service_1 = require("../products/products.service");
let VentasService = class VentasService {
    constructor(ventaRepository, productRepository, userRepository, productVentaRepository, loteRepository, productsService) {
        this.ventaRepository = ventaRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.productVentaRepository = productVentaRepository;
        this.loteRepository = loteRepository;
        this.productsService = productsService;
    }
    async create(createVentaDto, user) {
        console.log('Inicio de creación de venta:', createVentaDto);
        const metodosValidos = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO'];
        if (!metodosValidos.includes(createVentaDto.metodo_pago)) {
            throw new common_1.BadRequestException(`El método de pago ${createVentaDto.metodo_pago} no es válido.`);
        }
        const venta = await this.ventaRepository.save({
            user,
            cantidadTotal: 0,
            total: 0,
            fecha: new Date(),
            metodo_pago: createVentaDto.metodo_pago,
        });
        console.log('Venta creada con ID:', venta.id);
        const productosVenta = [];
        let total = 0;
        try {
            for (const prod of createVentaDto.productos) {
                console.log('Procesando producto:', prod);
                const product = await this.productRepository.findOne({ where: { id: prod.productId } });
                if (!product) {
                    throw new common_1.NotFoundException(`Producto con ID ${prod.productId} no encontrado.`);
                }
                const lotes = await this.loteRepository.find({
                    where: { producto: { id: prod.productId } },
                    order: { fechaCreacion: 'ASC' },
                });
                let loteSeleccionado = null;
                for (const lote of lotes) {
                    console.log(`Verificando lote ${lote.id} con stock: ${lote.stock}`);
                    if (lote.stock >= prod.cantidad) {
                        loteSeleccionado = lote;
                        break;
                    }
                }
                if (!loteSeleccionado) {
                    throw new common_1.NotFoundException(`No hay suficiente stock disponible para el producto ${prod.productId} en ningún lote.`);
                }
                console.log(`Lote seleccionado para el producto ${prod.productId}:`, loteSeleccionado);
                const productVenta = this.productVentaRepository.create({
                    product,
                    cantidad: prod.cantidad,
                    ventaPrice: prod.ventaPrice,
                    venta: venta,
                });
                productosVenta.push(productVenta);
                total += prod.ventaPrice * prod.cantidad;
                venta.cantidadTotal += prod.cantidad;
                loteSeleccionado.stock -= prod.cantidad;
                await this.loteRepository.save(loteSeleccionado);
                const totalStock = await this.productsService.calculateTotalStock(product.id, user);
                product.stockTotal = totalStock;
                await this.productRepository.save(product);
            }
            await this.productVentaRepository.save(productosVenta);
            venta.productos = productosVenta;
            venta.total = total;
            await this.ventaRepository.save(venta);
            console.log('Venta guardada con éxito:', venta);
            return venta;
        }
        catch (error) {
            console.error('Error al crear la venta:', error);
            throw new common_1.InternalServerErrorException(`Error al crear la venta: ${error.message}`);
        }
    }
    async update(id, updateVentaDto, user) {
        console.log(`Actualizando venta con ID: ${id}`);
        const venta = await this.ventaRepository.findOne({ where: { id }, relations: ['user', 'productos', 'productos.product'] });
        if (!venta) {
            throw new common_1.NotFoundException(`Venta con ID ${id} no encontrada.`);
        }
        if (venta.user.id !== user.id) {
            throw new common_1.BadRequestException('No puedes actualizar esta venta porque no eres el propietario.');
        }
        let total = 0;
        const productosVenta = [];
        for (const prod of updateVentaDto.productos) {
            console.log('Actualizando producto:', prod);
            const product = await this.productRepository.findOne({ where: { id: prod.productId } });
            if (!product) {
                throw new common_1.NotFoundException(`Producto con ID ${prod.productId} no encontrado.`);
            }
            const productVenta = this.productVentaRepository.create({
                product,
                cantidad: prod.cantidad,
                ventaPrice: prod.ventaPrice,
            });
            productosVenta.push(productVenta);
            total += Number(prod.ventaPrice) * Number(prod.cantidad);
        }
        venta.total = total;
        venta.cantidadTotal = productosVenta.reduce((sum, item) => sum + item.cantidad, 0);
        venta.productos = productosVenta;
        await this.ventaRepository.save(venta);
        await this.productVentaRepository.save(productosVenta);
        console.log('Venta actualizada con éxito:', venta);
        return { venta };
    }
    async remove(id, user) {
        console.log(`Intentando eliminar venta con ID: ${id}`);
        const venta = await this.ventaRepository.findOne({ where: { id }, relations: ['user'] });
        if (!venta) {
            throw new common_1.NotFoundException(`Venta con id ${id} no encontrada.`);
        }
        if (venta.user.id !== user.id) {
            throw new common_1.BadRequestException('No puedes eliminar esta venta porque no eres el propietario.');
        }
        await this.ventaRepository.remove(venta);
        console.log(`Venta con ID ${id} eliminada con éxito.`);
    }
    async findByDate(date, user) {
        const startDate = new Date(`${date}T00:00:00.000Z`);
        startDate.setHours(startDate.getHours() - 3);
        const endDate = new Date(`${date}T23:59:59.999Z`);
        endDate.setHours(endDate.getHours() - 3);
        console.log('Consultando ventas desde:', startDate.toISOString(), 'hasta:', endDate.toISOString(), 'para el usuario:', user.id);
        const ventas = await this.ventaRepository.find({
            where: {
                fecha: (0, typeorm_2.Between)(startDate, endDate),
                user: { id: user.id },
            },
            relations: ['productos', 'productos.product'],
        });
        console.log('Ventas encontradas:', ventas);
        return ventas;
    }
    async findAll(user) {
        console.log(`Buscando todas las ventas para el usuario con ID: ${user.id}`);
        const ventas = await this.ventaRepository.find({
            where: { user },
            relations: ['productos', 'productos.product'],
        });
        console.log(`Ventas encontradas:`, ventas);
        return ventas;
    }
    handleDBExceptions(error) {
        console.error('Error en la base de datos:', error);
        throw new common_1.BadRequestException('Error al interactuar con la base de datos');
    }
    async findByMetodoPago(metodoPago, user) {
        const metodosValidos = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO'];
        if (!metodosValidos.includes(metodoPago)) {
            throw new common_1.BadRequestException(`El método de pago ${metodoPago} no es válido.`);
        }
        return this.ventaRepository.find({
            where: {
                user: { id: user.id },
                metodo_pago: metodoPago,
            },
            relations: ['productos', 'productos.product'],
        });
    }
    async obtenerResumenVentas(user) {
        const hoy = new Date();
        const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const inicioAño = new Date(hoy.getFullYear(), 0, 1);
        const ventasDiarias = await this.ventaRepository.find({
            where: {
                user: { id: user.id },
                fecha: (0, typeorm_2.Between)(inicioDia, hoy),
            },
        });
        const sumaDiaria = ventasDiarias.reduce((sum, venta) => sum + Number(venta.total), 0);
        const ventasMensuales = await this.ventaRepository.find({
            where: {
                user: { id: user.id },
                fecha: (0, typeorm_2.Between)(inicioMes, hoy),
            },
        });
        const sumaMensual = ventasMensuales.reduce((sum, venta) => sum + Number(venta.total), 0);
        const ventasAnuales = await this.ventaRepository.find({
            where: {
                user: { id: user.id },
                fecha: (0, typeorm_2.Between)(inicioAño, hoy),
            },
        });
        const sumaAnual = ventasAnuales.reduce((sum, venta) => sum + Number(venta.total), 0);
        return {
            ventasDiarias: { total: ventasDiarias.length, suma: sumaDiaria },
            ventasMensuales: { total: ventasMensuales.length, suma: sumaMensual },
            ventasAnuales: { total: ventasAnuales.length, suma: sumaAnual },
        };
    }
};
exports.VentasService = VentasService;
exports.VentasService = VentasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ventas_entity_1.Venta)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(ventas_entity_1.ProductVenta)),
    __param(4, (0, typeorm_1.InjectRepository)(lotes_entity_1.Lote)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        products_service_1.ProductsService])
], VentasService);
//# sourceMappingURL=ventas.service.js.map