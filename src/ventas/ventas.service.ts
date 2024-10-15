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
        // Primero, creamos y guardamos la venta para generar el id
        const venta = await this.ventaRepository.save({
            user,
            cantidadTotal: 0,
            total: 0,
            fecha: new Date(),
        });
    
        const productosVenta: ProductVenta[] = [];
    
        try {
            for (const prod of createVentaDto.productos) {
                const product = await this.productRepository.findOne({ where: { id: prod.productId } });
                if (!product) {
                    throw new NotFoundException(`Producto con ID ${prod.productId} no encontrado.`);
                }
    
                const productVenta = this.productVentaRepository.create({
                    product,
                    cantidad: prod.cantidad,
                    ventaPrice: prod.ventaPrice,
                    venta: venta, // Asignamos la relación con la venta que ya tiene id
                });
    
                productosVenta.push(productVenta);
                venta.total += prod.ventaPrice * prod.cantidad;
                venta.cantidadTotal += prod.cantidad;
            }
    
            venta.productos = productosVenta;
    
            // Guardamos los productos de la venta
            await this.productVentaRepository.save(productosVenta);
    
            // Actualizamos la venta con el total y la cantidad total de productos
            await this.ventaRepository.save(venta);
    
            return venta;
        } catch (error) {
            console.error('Error al crear la venta:', error);
            throw new InternalServerErrorException(`Error al crear la venta: ${error.message}`);
        }
    }
    
    
    
    
    

    async update(id: string, updateVentaDto: UpdateVentaDto, user: User): Promise<{ venta: Venta }> {
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
            total += prod.ventaPrice * prod.cantidad; // Sumar al total
        }
    
        venta.total = total; // Actualizar el total
        venta.cantidadTotal = productosVenta.reduce((sum, item) => sum + item.cantidad, 0); // Sumar las cantidades de productos
    
        venta.productos = productosVenta; // Asignar los productos a la venta
    
        // Guardar la venta actualizada
        await this.ventaRepository.save(venta);
        await this.productVentaRepository.save(productosVenta); // Guardar cada relación en product_venta
    
        return { venta }; // Retornar la venta actualizada
    }
    

    async remove(id: string, user: User): Promise<void> {
        const venta = await this.ventaRepository.findOne({ where: { id }, relations: ['user'] });

        if (!venta) {
            throw new NotFoundException(`Venta con id ${id} no encontrada.`);
        }

        // Verificar que el usuario que intenta eliminar la venta es el propietario
        if (venta.user.id !== user.id) {
            throw new BadRequestException('No puedes eliminar esta venta porque no eres el propietario.');
        }

        await this.ventaRepository.remove(venta);
    }

    async findByDate(date: string, user: User): Promise<Venta[]> {
        const fechaBuscada = new Date(date); // Convierte la cadena a Date
    
        if (isNaN(fechaBuscada.getTime())) {
            throw new BadRequestException('La fecha proporcionada no es válida.');
        }
    
        return this.ventaRepository.find({
            where: {
                fecha: fechaBuscada, // Usa el objeto Date aquí
                user: { id: user.id }, // Relación con el usuario
            },
            relations: ['productos', 'productos.product'], // Incluir las relaciones necesarias
        });
    }
    

    async findAll(user: User): Promise<Venta[]> {
        return await this.ventaRepository.find({
            where: { user },
            relations: ['productos', 'productos.product'],
        });
    }

    private handleDBExceptions(error: any): void {
        // Maneja errores relacionados a la base de datos
        throw new BadRequestException('Error al interactuar con la base de datos');
    }
}
