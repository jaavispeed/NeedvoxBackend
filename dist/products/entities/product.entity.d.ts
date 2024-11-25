import { User } from "src/auth/entities/user.entity";
import { Lote } from "src/lotes/entities/lotes.entity";
export declare class Product {
    id: string;
    title: string;
    stockTotal: number;
    slug: string;
    user: User;
    barcode?: string;
    fechaCreacion: Date;
    lotes: Lote[];
    checkSlugInsert(): void;
    checkSlugUpdate(): void;
    private generateSlug;
}
