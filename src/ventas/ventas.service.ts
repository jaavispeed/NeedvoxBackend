import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ProductVenta, Venta } from './entities/ventas.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/auth/entities/user.entity';
import { Lote } from 'src/lotes/entities/lotes.entity';

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
        @InjectRepository(Lote) // Asegúrate de inyectar el repositorio de Lote
        private readonly loteRepository: Repository<Lote>,
    ) {}

    async create(createVentaDto: CreateVentaDto, user: User): Promise<Venta> {
        console.log('Inicio de creación de venta:', createVentaDto);
    
        const venta = await this.ventaRepository.save({
            user,
            cantidadTotal: 0,
            total: 0,
            fecha: new Date(),
        });
    
        console.log('Venta creada con ID:', venta.id);
    
        const productosVenta: ProductVenta[] = [];
        let total = 0;
    
        try {
            for (const prod of createVentaDto.productos) {
                console.log('Procesando producto:', prod);
    
                const product = await this.productRepository.findOne({ where: { id: prod.productId } });
                if (!product) {
                    throw new NotFoundException(`Producto con ID ${prod.productId} no encontrado.`);
                }
    
                // Obtener el lote correspondiente
                const lote = await this.loteRepository.findOne({ where: { id: prod.loteId } });
                if (!lote) {
                    throw new NotFoundException(`Lote con ID ${prod.loteId} no encontrado.`);
                }
    
                // Verificar si hay suficiente stock en el lote
                if (lote.stock < prod.cantidad) {
                    throw new BadRequestException(`No hay suficiente stock en el lote ${lote.id}.`);
                }
    
                // Restar del stock del lote
                lote.stock -= prod.cantidad;
    
                // Crear la relación del producto en la venta
                const productVenta = this.productVentaRepository.create({
                    product,
                    cantidad: prod.cantidad,
                    ventaPrice: prod.ventaPrice,
                    venta: venta,
                    lote: lote, // Asignar el lote a la relación
                });
    
                productosVenta.push(productVenta);
                total += prod.ventaPrice * prod.cantidad;
                venta.cantidadTotal += prod.cantidad;
    
                // Guardar la actualización del lote
                await this.loteRepository.save(lote);
            }
    
            venta.productos = productosVenta;
            venta.total = total;
    
            await this.productVentaRepository.save(productosVenta);
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
        // Establece la fecha de inicio para el 19 de octubre de 2024
        const startDate = new Date(`${date}T00:00:00.000Z`); // '2024-10-19T00:00:00.000Z'
        // Ajusta a UTC-3 para la fecha de inicio
        startDate.setHours(startDate.getHours() - 3); // Esto dará '2024-10-18T21:00:00.000Z'
    
        // Establece la fecha de fin para el 19 de octubre de 2024
        const endDate = new Date(`${date}T23:59:59.999Z`); // '2024-10-19T23:59:59.999Z'
        // Ajusta a UTC-3 para la fecha de fin
        endDate.setHours(endDate.getHours() - 3); // Esto dará '2024-10-19T20:59:59.999Z'
    
        console.log('Consultando ventas desde:', startDate.toISOString(), 'hasta:', endDate.toISOString(), 'para el usuario:', user.id);
    
        const ventas = await this.ventaRepository.find({
            where: {
                fecha: Between(startDate, endDate), // Rango de fechas en UTC
                user: { id: user.id }, // Filtra por el ID del usuario
            },
            relations: ['productos', 'productos.product'],
        });
    
        console.log('Ventas encontradas:', ventas);
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
