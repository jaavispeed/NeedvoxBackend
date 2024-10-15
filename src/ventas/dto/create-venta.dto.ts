import { IsInt, IsPositive, IsNumber, IsUUID } from 'class-validator';

export class CreateVentaDto {
    @IsUUID()
    productId: string;

    @IsUUID()
    userId: string;

    @IsInt()
    @IsPositive()
    cantidad: number;

    @IsNumber()
    @IsPositive()
    ventaPrice: number;
}
