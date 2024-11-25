import { CreateVentaDto } from './dto/create-venta.dto';
import { VentasService } from './ventas.service';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { ProductVenta, Venta } from './entities/ventas.entity';
import { ProductventaService } from './productventa.service';
export declare class VentasController {
    private readonly ventasService;
    private readonly productVentaService;
    constructor(ventasService: VentasService, productVentaService: ProductventaService);
    obtenerResumenVentas(req: any): Promise<{
        ventasDiarias: number;
        ventasMensuales: number;
        ventasAnuales: number;
    }>;
    create(createVentaDto: CreateVentaDto, req: any): Promise<Venta>;
    update(id: string, updateVentaDto: UpdateVentaDto, req: any): Promise<{
        venta: Venta;
    }>;
    remove(id: string, req: any): Promise<void>;
    findByDate(date: string, req: any): Promise<Venta[]>;
    findByMetodoPago(metodoPago: string, req: any): Promise<Venta[]>;
    findAll(req: any): Promise<Venta[]>;
    obtenerTodos(): Promise<ProductVenta[]>;
    obtenerPorId(id: string): Promise<ProductVenta>;
}
