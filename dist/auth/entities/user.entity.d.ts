import { Lote } from "src/lotes/entities/lotes.entity";
import { Product } from "src/products/entities/product.entity";
import { Venta } from "src/ventas/entities/ventas.entity";
export declare class User {
    id: string;
    email: string;
    username: string;
    password: string;
    isActive: boolean;
    roles: string[];
    products: Product[];
    ventas: Venta[];
    lotes: Lote[];
    checkFieldsBeforeInsert(): void;
    checkFieldsBeforeUpdate(): void;
}
