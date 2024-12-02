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
import { format, toZonedTime } from 'date-fns-tz';


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

    ) {}

    async create(createVentaDto: CreateVentaDto, user: User): Promise<Venta> {
        console.log('Inicio de creación de venta:', createVentaDto);
    
        // Zona horaria de Chile
        const timeZone = 'America/Santiago';
    
        // Validación de metodo_pago
        const metodosValidos: ('EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO')[] = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO'];
        if (!metodosValidos.includes(createVentaDto.metodo_pago as 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO')) {
            throw new BadRequestException(`El método de pago ${createVentaDto.metodo_pago} no es válido.`);
        }
    
        // Convertir la fecha actual a la zona horaria de Chile
        const fechaLocal = toZonedTime(new Date(), timeZone);  // Obtener la fecha local en la zona horaria de Chile
    
        // Crear la venta en la base de datos con la fecha ajustada
        const venta = await this.ventaRepository.save({
            user,
            cantidadTotal: 0,
            total: 0,
            fecha: fechaLocal, // Fecha ajustada a la zona horaria de Chile
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
    
                // Crear la relación del producto en la venta
                const productVenta = this.productVentaRepository.create({
                    product,
                    cantidad: prod.cantidad,
                    ventaPrice: prod.ventaPrice,
                    venta: venta,
                });
    
                // Sumar a la lista de productos de la venta
                productosVenta.push(productVenta);
                total += prod.ventaPrice * prod.cantidad;  // Calcular el total de la venta
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
            return venta; // Aquí no se cambia la fecha, se mantiene como tipo Date
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
        // Zona horaria de Chile
        const timeZone = 'America/Santiago'; 
    
        // Establecer la fecha de inicio y fin para el rango de búsqueda en la zona horaria local
        const startDate = new Date(`${date}T00:00:00.000`);
        const endDate = new Date(`${date}T23:59:59.999`);
    
        // Ajustar las fechas a la zona horaria local
        const startDateLocal = toZonedTime(startDate, timeZone);
        const endDateLocal = toZonedTime(endDate, timeZone);
    
        console.log('Consultando ventas desde:', startDateLocal.toISOString(), 'hasta:', endDateLocal.toISOString(), 'para el usuario:', user.id);
        
        // Consultar las ventas por fecha y usuario
        const ventas = await this.ventaRepository.find({
            where: {
                fecha: Between(startDateLocal, endDateLocal),
                user: { id: user.id },
            },
            relations: ['productos', 'productos.product'],
        });
    
        // Convertir las fechas de UTC a la zona horaria local
        const ventasConFechasLocales = ventas.map(venta => {
            const fechaLocal = toZonedTime(venta.fecha, timeZone); 
            return {
                ...venta,
                fecha: fechaLocal, // Asignar la fecha convertida
            };
        });
    
        console.log('Ventas encontradas con fechas locales:', ventasConFechasLocales);
        return ventasConFechasLocales;
    }
    
    
    
    

    async findAll(user: User): Promise<Venta[]> {
        console.log(`Buscando todas las ventas para el usuario con ID: ${user.id}`);
    
        // Obtener todas las ventas del usuario
        const ventas = await this.ventaRepository.find({
            where: { user },
            relations: ['productos', 'productos.product'],
        });
    
        // Zona horaria de Chile
        const timeZone = 'America/Santiago';
    
        // Convertir las fechas de UTC a la zona horaria de Chile
        const ventasConFechasLocales = ventas.map(venta => {
            const fechaLocal = toZonedTime(venta.fecha, timeZone); 
            return {
                ...venta,
                fecha: fechaLocal, // Devolver la fecha como Date ajustada a la zona horaria de Chile
            };
        });
    
        console.log(`Ventas encontradas con fechas locales:`, ventasConFechasLocales);
        return ventasConFechasLocales;
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


    async obtenerResumenVentas(user: User): Promise<{ ventasDiarias: number; ventasMensuales: number; ventasAnuales: number }> {
        const hoy = new Date();
        const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const inicioAño = new Date(hoy.getFullYear(), 0, 1);
    
        const ventasDiarias = await this.ventaRepository.count({
            where: {
                user: { id: user.id },
                fecha: Between(inicioDia, hoy),
            },
        });
    
        const ventasMensuales = await this.ventaRepository.count({
            where: {
                user: { id: user.id },
                fecha: Between(inicioMes, hoy),
            },
        });
    
        const ventasAnuales = await this.ventaRepository.count({
            where: {
                user: { id: user.id },
                fecha: Between(inicioAño, hoy),
            },
        });
    
        return {
            ventasDiarias,
            ventasMensuales,
            ventasAnuales,
        };
    }
    



    
}
