import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsInt, IsNumber, IsOptional, IsString, Min, IsDateString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsString()
    @IsOptional()
    title?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    compraPrice?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    ventaPrice?: number;

    @IsInt()
    @IsOptional()
    @Min(0)
    stock?: number;

    @IsDateString()
    @IsOptional()
    expiryDate?: string | null; // Añadido como opcional
}
