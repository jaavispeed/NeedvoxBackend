import { 
    BadRequestException, 
    Injectable, 
    InternalServerErrorException, 
    Logger, 
    NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Venta } from './entities/ventas.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/auth/entities/user.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';

@Injectable()
export class VentasService {
    private readonly logger = new Logger('VentasService');

    constructor(
        @InjectRepository(Venta)
        private readonly ventaRepository: Repository<Venta>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(createVentaDto: CreateVentaDto, user: User) {
        const { productId, cantidad, ventaPrice } = createVentaDto;

        const product = await this.productRepository.findOne({ where: { id: productId } });
        if (!product) {
            throw new NotFoundException(`Producto con id ${productId} no encontrado.`);
        }

        if (product.stock < cantidad) {
            throw new BadRequestException(`Stock insuficiente para el producto ${product.title}.`);
        }

        const venta = this.ventaRepository.create({
            product,
            user,
            cantidad,
            ventaPrice,
        });

        try {
            await this.ventaRepository.save(venta);
            product.stock -= cantidad; // Actualizar stock
            await this.productRepository.save(product);
            return venta;
        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    private handleDBExceptions(error: any) {
        this.logger.error(error);
        throw new InternalServerErrorException('Error inesperado, revisa los logs del servidor');
    }

    async update(id: string, updateVentaDto: UpdateVentaDto, user: User): Promise<{ venta: Venta; stock: number }> {
        // Buscar la venta por ID junto con las relaciones necesarias
        const venta = await this.ventaRepository.findOne({ where: { id }, relations: ['user', 'product'] });
    
        if (!venta) {
            throw new NotFoundException(`Venta con id ${id} no encontrada.`);
        }
    
        // Verificar que el usuario que intenta actualizar la venta es el propietario
        if (venta.user.id !== user.id) {
            throw new BadRequestException('No puedes actualizar esta venta porque no eres el propietario.');
        }
    
        // Obtener el producto relacionado con la venta
        const product = await this.productRepository.findOne({ where: { id: venta.product.id } });
        if (!product) {
            throw new NotFoundException(`Producto con id ${venta.product.id} no encontrado.`);
        }
    
        // Guardar la cantidad anterior
        const cantidadAnterior = venta.cantidad;
    
        // Actualizar los campos solo si se proporcionan en el DTO
        if (updateVentaDto.productId) {
            const newProduct = await this.productRepository.findOne({ where: { id: updateVentaDto.productId } });
            if (!newProduct) {
                throw new NotFoundException(`Producto con id ${updateVentaDto.productId} no encontrado.`);
            }
            venta.product = newProduct; // Asignar el nuevo producto
        }
    
        if (updateVentaDto.cantidad !== undefined) {
            const nuevaCantidad = updateVentaDto.cantidad;
    
            // Ajustar el stock del producto
            if (nuevaCantidad < cantidadAnterior) {
                // Si la nueva cantidad es menor, aumentamos el stock
                product.stock += (cantidadAnterior - nuevaCantidad);
            } else if (nuevaCantidad > cantidadAnterior) {
                // Si la nueva cantidad es mayor, verificamos si hay suficiente stock
                const cantidadRequerida = nuevaCantidad - cantidadAnterior;
                if (product.stock < cantidadRequerida) {
                    throw new BadRequestException(`Stock insuficiente para el producto ${product.title}.`);
                }
                product.stock -= cantidadRequerida; // Disminuimos el stock
            }
    
            venta.cantidad = nuevaCantidad; // Actualizar la cantidad de la venta
        }
    
        if (updateVentaDto.ventaPrice !== undefined) {
            venta.ventaPrice = updateVentaDto.ventaPrice; // Actualizar el precio de venta
        }
    
        try {
            // Guardar la venta actualizada y el producto
            const updatedVenta = await this.ventaRepository.save(venta);
            await this.productRepository.save(product); // Asegurarse de guardar el producto con el stock actualizado
    
            const stock = product.stock; // Obtener el stock actualizado
    
            return { venta: updatedVenta, stock }; // Devolver la venta actualizada y el stock
        } catch (error) {
            this.handleDBExceptions(error);
        }
    }
    

    async findAll(user: User): Promise<Venta[]> {
        return await this.ventaRepository.find({ where: { user } });
    }
}
