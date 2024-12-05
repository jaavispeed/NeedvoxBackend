import { CreateProductDto } from './create-product.dto';
declare const UpdateProductDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateProductDto>>;
export declare class UpdateProductDto extends UpdateProductDto_base {
    title?: string;
    slug?: string;
    barcode?: string;
    stockTotal?: number;
    precioVenta?: number;
}
export {};
