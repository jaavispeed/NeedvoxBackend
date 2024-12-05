import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsInt, IsNumber, IsOptional, IsString, Min, IsDateString, IsPositive } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsString()
    @IsOptional()
    title?: string;
    
    @IsString()
    @IsOptional()
    slug?: string; // Si decides mantenerlo como opcional

    @IsString()
    @IsOptional()
    barcode?: string;

    @IsNumber()
    @IsOptional()
    stockTotal?: number; // Agrega esta línea

    @IsInt()
    @IsOptional()  // Hacer que precioVenta sea opcional
    @IsPositive()
    precioVenta?: number;  // Ahora es opcional
}
