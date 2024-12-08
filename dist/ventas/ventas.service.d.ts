import { Repository } from 'typeorm';
import { ProductVenta, Venta } from './entities/ventas.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/auth/entities/user.entity';
import { Lote } from 'src/lotes/entities/lotes.entity';
import { ProductsService } from 'src/products/products.service';
export declare class VentasService {
    private readonly ventaRepository;
    private readonly productRepository;
    private readonly userRepository;
    private readonly productVentaRepository;
    private readonly loteRepository;
    private readonly productsService;
    constructor(ventaRepository: Repository<Venta>, productRepository: Repository<Product>, userRepository: Repository<User>, productVentaRepository: Repository<ProductVenta>, loteRepository: Repository<Lote>, productsService: ProductsService);
    create(createVentaDto: CreateVentaDto, user: User): Promise<Venta>;
    update(id: string, updateVentaDto: UpdateVentaDto, user: User): Promise<{
        venta: Venta;
    }>;
    remove(id: string, user: User): Promise<void>;
    findByDate(date: string, user: User): Promise<Venta[]>;
    findAll(user: User): Promise<Venta[]>;
    private handleDBExceptions;
    findByMetodoPago(metodoPago: string, user: User): Promise<Venta[]>;
    obtenerResumenVentas(user: User): Promise<{
        ventasDiarias: {
            total: number;
            suma: number;
        };
        ventasMensuales: {
            total: number;
            suma: number;
        };
        ventasAnuales: {
            total: number;
            suma: number;
        };
    }>;
}
