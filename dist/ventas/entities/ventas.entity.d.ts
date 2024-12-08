import { User } from 'src/auth/entities/user.entity';
import { Lote } from 'src/lotes/entities/lotes.entity';
import { Product } from 'src/products/entities/product.entity';
export declare class Venta {
    id: string;
    cantidadTotal: number;
    total: number;
    fecha: Date;
    user: User;
    productos: ProductVenta[];
    metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO';
}
export declare class ProductVenta {
    id: string;
    cantidad: number;
    ventaPrice: number;
    product: Product;
    venta: Venta;
    lote: Lote;
}
