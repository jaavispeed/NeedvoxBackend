import { User } from 'src/auth/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
export declare class Lote {
    id: string;
    precioCompra: number;
    precioVenta: number;
    stock: number;
    fechaCaducidad: Date;
    fechaCreacion: Date;
    producto: Product;
    user: User;
}
