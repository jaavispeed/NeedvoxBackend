import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVenta, Venta } from './entities/ventas.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class VentasService {
    constructor(
        @InjectRepository(Venta)
        private readonly ventaRepository: Repository<Venta>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(ProductVenta)
        private readonly productVentaRepository: Repository<ProductVenta>,
    ) {}

    async create(createVentaDto: CreateVentaDto, user: User): Promise<Venta> {
        console.log('Inicio de creación de venta:', createVentaDto);

        // Primero, creamos y guardamos la venta para generar el id
        const venta = await this.ventaRepository.save({
            user,
            cantidadTotal: 0,
            total: 0,
            fecha: new Date(),
        });
    
        console.log('Venta creada con ID:', venta.id);

        const productosVenta: ProductVenta[] = [];
        let total = 0; // Inicializar el total aquí

        try {
            for (const prod of createVentaDto.productos) {
                console.log('Procesando producto:', prod);

                const product = await this.productRepository.findOne({ where: { id: prod.productId } });
                if (!product) {
                    throw new NotFoundException(`Producto con ID ${prod.productId} no encontrado.`);
                }
    
                // Verificar si hay suficiente stock
                if (product.stock < prod.cantidad) {
                    throw new BadRequestException(`No hay suficiente stock para el producto ${prod.productId}.`);
                }
    
                // Crear la relación del producto en la venta
                const productVenta = this.productVentaRepository.create({
                    product,
                    cantidad: prod.cantidad,
                    ventaPrice: prod.ventaPrice,
                    venta: venta,
                });
    
                productosVenta.push(productVenta);
                total += prod.ventaPrice * prod.cantidad; // Calcular el total aquí
                venta.cantidadTotal += prod.cantidad;
    
                // Restar del stock del producto
                product.stock -= prod.cantidad;
                await this.productRepository.save(product); // Guardar la actualización del producto

                console.log(`Stock del producto ${prod.productId} actualizado. Nuevo stock: ${product.stock}`);
            }
    
            venta.productos = productosVenta;
            venta.total = total; // Asignar el total calculado a la venta
    
            // Guardamos los productos de la venta
            await this.productVentaRepository.save(productosVenta);
    
            // Actualizamos la venta con el total y la cantidad total de productos
            await this.ventaRepository.save(venta);
    
            console.log('Venta guardada con éxito:', venta);
            return venta;
        } catch (error) {
            console.error('Error al crear la venta:', error);
            throw new InternalServerErrorException(`Error al crear la venta: ${error.message}`);
        }
    }
    
    

    async update(id: string, updateVentaDto: UpdateVentaDto, user: User): Promise<{ venta: Venta }> {
        console.log(`Actualizando venta con ID: ${id}`);

        // Buscar la venta por ID junto con las relaciones necesarias
        const venta = await this.ventaRepository.findOne({ where: { id }, relations: ['user', 'productos', 'productos.product'] });
    
        if (!venta) {
            throw new NotFoundException(`Venta con ID ${id} no encontrada.`);
        }
    
        // Verificar que el usuario que intenta actualizar la venta es el propietario
        if (venta.user.id !== user.id) {
            throw new BadRequestException('No puedes actualizar esta venta porque no eres el propietario.');
        }
    
        // Actualizar los productos y calcular el nuevo total
        let total = 0;
        const productosVenta: ProductVenta[] = [];
    
        for (const prod of updateVentaDto.productos) {
            console.log('Actualizando producto:', prod);

            const product = await this.productRepository.findOne({ where: { id: prod.productId } }); // Cambiado a un objeto
            if (!product) {
                throw new NotFoundException(`Producto con ID ${prod.productId} no encontrado.`);
            }
    
            const productVenta = this.productVentaRepository.create({
                product,
                cantidad: prod.cantidad,
                ventaPrice: prod.ventaPrice,
            });
    
            productosVenta.push(productVenta);
            total += Number(prod.ventaPrice) * Number(prod.cantidad); // Sumar al total como número
        }
    
        venta.total = total; // Actualizar el total
        venta.cantidadTotal = productosVenta.reduce((sum, item) => sum + item.cantidad, 0); // Sumar las cantidades de productos
    
        venta.productos = productosVenta; // Asignar los productos a la venta
    
        // Guardar la venta actualizada
        await this.ventaRepository.save(venta);
        await this.productVentaRepository.save(productosVenta); // Guardar cada relación en product_venta
    
        console.log('Venta actualizada con éxito:', venta);
        return { venta }; // Retornar la venta actualizada
    }
    

    async remove(id: string, user: User): Promise<void> {
        console.log(`Intentando eliminar venta con ID: ${id}`);

        const venta = await this.ventaRepository.findOne({ where: { id }, relations: ['user'] });

        if (!venta) {
            throw new NotFoundException(`Venta con id ${id} no encontrada.`);
        }

        // Verificar que el usuario que intenta eliminar la venta es el propietario
        if (venta.user.id !== user.id) {
            throw new BadRequestException('No puedes eliminar esta venta porque no eres el propietario.');
        }

        await this.ventaRepository.remove(venta);
        console.log(`Venta con ID ${id} eliminada con éxito.`);
    }

    async findByDate(date: string, user: User): Promise<Venta[]> {
        console.log('Buscando ventas por fecha:', date);

        const fechaBuscada = new Date(date); // Convierte la cadena a Date
    
        if (isNaN(fechaBuscada.getTime())) {
            throw new BadRequestException('La fecha proporcionada no es válida.');
        }
    
        const ventas = await this.ventaRepository.find({
            where: {
                fecha: fechaBuscada, // Usa el objeto Date aquí
                user: { id: user.id }, // Relación con el usuario
            },
            relations: ['productos', 'productos.product'], // Incluir las relaciones necesarias
        });

        console.log(`Ventas encontradas:`, ventas);
        return ventas;
    }
    

    async findAll(user: User): Promise<Venta[]> {
        console.log(`Buscando todas las ventas para el usuario con ID: ${user.id}`);

        const ventas = await this.ventaRepository.find({
            where: { user },
            relations: ['productos', 'productos.product'],
        });

        console.log(`Ventas encontradas:`, ventas);
        return ventas;
    }

    private handleDBExceptions(error: any): void {
        // Maneja errores relacionados a la base de datos
        console.error('Error en la base de datos:', error);
        throw new BadRequestException('Error al interactuar con la base de datos');
    }
}
