import { Repository } from 'typeorm';
import { ProductVenta } from './entities/ventas.entity';
export declare class ProductventaService {
    private readonly productVentaRepository;
    constructor(productVentaRepository: Repository<ProductVenta>);
    obtenerTodos(): Promise<ProductVenta[]>;
    obtenerPorId(id: string): Promise<ProductVenta>;
}
