import { IsInt, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class UpdateProductVentaDto {
    @IsOptional()
    @IsUUID()
    productId?: string;

    @IsOptional()
    @IsInt()
    @IsPositive()
    cantidad?: number;

    @IsOptional()
    @IsPositive()
    ventaPrice?: number; // Este es el precio unitario durante la venta
}

export class UpdateVentaDto {
    @IsOptional()
    productos?: UpdateProductVentaDto[];
}
