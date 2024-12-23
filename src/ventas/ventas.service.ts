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
import { ProductsService } from 'src/products/products.service';

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
        private readonly productsService: ProductsService, // Inyección del ProductsService

    ) { }

    async create(createVentaDto: CreateVentaDto, user: User): Promise<Venta> {
        console.log('Inicio de creación de venta:', createVentaDto);
    
        // Validación de metodo_pago
        const metodosValidos: ('EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO')[] = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO'];
        if (!metodosValidos.includes(createVentaDto.metodo_pago as 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO')) {
            throw new BadRequestException(`El método de pago ${createVentaDto.metodo_pago} no es válido.`);
        }
    
        // Crear la venta en la base de datos
        const venta = await this.ventaRepository.save({
            user,
            cantidadTotal: 0,
            total: 0,
            fecha: new Date(),
            metodo_pago: createVentaDto.metodo_pago,  // Asignar el metodo_pago correctamente
        });
    
        console.log('Venta creada con ID:', venta.id);
    
        const productosVenta: ProductVenta[] = [];
        let total = 0;
    
        try {
            // Procesar los productos de la venta
            for (const prod of createVentaDto.productos) {
                console.log('Procesando producto:', prod);
    
                const product = await this.productRepository.findOne({ where: { id: prod.productId } });
                if (!product) {
                    throw new NotFoundException(`Producto con ID ${prod.productId} no encontrado.`);
                }
    
                // Buscar los lotes disponibles con stock suficiente para el producto
                const lotes = await this.loteRepository.find({
                    where: { producto: { id: prod.productId } },
                    order: { fechaCreacion: 'ASC' }, // Ordenar por fecha de creación si lo prefieres
                });
    
                let loteSeleccionado = null;
    
                // Buscar un lote con suficiente stock
                for (const lote of lotes) {
                    console.log(`Verificando lote ${lote.id} con stock: ${lote.stock}`);
                    if (lote.stock >= prod.cantidad) {
                        loteSeleccionado = lote;
                        break; // Se detiene en el primer lote con stock suficiente
                    }
                }
    
                if (!loteSeleccionado) {
                    throw new NotFoundException(`No hay suficiente stock disponible para el producto ${prod.productId} en ningún lote.`);
                }
    
                console.log(`Lote seleccionado para el producto ${prod.productId}:`, loteSeleccionado);
    
                // Aquí asignamos el precio de venta desde el producto
                const ventaPrice = product.precioVenta;  // Tomamos el precio del producto
    
                // Crear la relación del producto en la venta
                const productVenta = this.productVentaRepository.create({
                    product,
                    cantidad: prod.cantidad,
                    ventaPrice,  // Usamos el precio del producto
                    venta: venta,
                });
    
                // Sumar a la lista de productos de la venta
                productosVenta.push(productVenta);
                total += ventaPrice * prod.cantidad;  // Calcular el total de la venta
                venta.cantidadTotal += prod.cantidad; // Acumular la cantidad total de productos
    
                // Restar del stock del lote seleccionado
                loteSeleccionado.stock -= prod.cantidad; // Restar la cantidad vendida
                await this.loteRepository.save(loteSeleccionado); // Guardar la actualización del lote
    
                // Actualizar el stockTotal del producto
                const totalStock = await this.productsService.calculateTotalStock(product.id, user);
                product.stockTotal = totalStock; // Asigna el stock total
                await this.productRepository.save(product); // Guardar la actualización del producto
            }
    
            // Guardar los productos de la venta en la base de datos
            await this.productVentaRepository.save(productosVenta);
    
            // Actualizar la venta con el total y la cantidad total de productos
            venta.productos = productosVenta; // Asociar los productos a la venta
            venta.total = total; // Establecer el total de la venta
    
            await this.ventaRepository.save(venta); // Guardar la venta
    
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

    async findByMetodoPago(metodoPago: string, user: User): Promise<Venta[]> {
        // Verifica si el valor de metodoPago es uno de los valores válidos del enum
        const metodosValidos: ('EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO')[] = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO'];

        if (!metodosValidos.includes(metodoPago as 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO')) {
            throw new BadRequestException(`El método de pago ${metodoPago} no es válido.`);
        }

        // Realiza la consulta con los filtros correctos
        return this.ventaRepository.find({
            where: {
                user: { id: user.id }, // Filtrar por el ID del usuario para asegurar que sea el usuario correcto
                metodo_pago: metodoPago as 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO', // Asegúrate de que metodo_pago sea del tipo adecuado
            },
            relations: ['productos', 'productos.product'], // Cargar relaciones necesarias
        });
    }


    async obtenerResumenVentas(user: User): Promise<{
        ventasDiarias: { total: number; suma: number };
        ventasMensuales: { total: number; suma: number };
        ventasAnuales: { total: number; suma: number };
    }> {
        const hoy = new Date();
        const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const inicioAño = new Date(hoy.getFullYear(), 0, 1);
    
        // Ventas diarias
        const ventasDiarias = await this.ventaRepository.find({
            where: {
                user: { id: user.id },
                fecha: Between(inicioDia, hoy),
            },
        });
        const sumaDiaria = ventasDiarias.reduce((sum, venta) => sum + Number(venta.total), 0);
    
        // Ventas mensuales
        const ventasMensuales = await this.ventaRepository.find({
            where: {
                user: { id: user.id },
                fecha: Between(inicioMes, hoy),
            },
        });
        const sumaMensual = ventasMensuales.reduce((sum, venta) => sum + Number(venta.total), 0);
    
        // Ventas anuales
        const ventasAnuales = await this.ventaRepository.find({
            where: {
                user: { id: user.id },
                fecha: Between(inicioAño, hoy),
            },
        });
        const sumaAnual = ventasAnuales.reduce((sum, venta) => sum + Number(venta.total), 0);
    
        return {
            ventasDiarias: { total: ventasDiarias.length, suma: sumaDiaria },
            ventasMensuales: { total: ventasMensuales.length, suma: sumaMensual },
            ventasAnuales: { total: ventasAnuales.length, suma: sumaAnual },
        };
    }
    

}
