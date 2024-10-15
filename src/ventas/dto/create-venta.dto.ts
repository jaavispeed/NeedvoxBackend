import { IsArray, IsInt, IsPositive, IsUUID } from 'class-validator';

export class CreateProductVentaDto {
    @IsUUID()
    productId: string;

    @IsInt()
    @IsPositive()
    cantidad: number;

    @IsPositive()
    ventaPrice: number; // Este es el precio unitario durante la venta
}

export class CreateVentaDto {
    @IsArray()
    productos: CreateProductVentaDto[];

    @IsUUID()
    userId: string; // Si necesitas incluir el ID del usuario
}
