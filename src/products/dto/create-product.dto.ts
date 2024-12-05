import { IsInt, IsNumber, IsOptional, IsPositive, IsString, Min, MinLength, IsDateString } from "class-validator";

export class CreateProductDto {
    @IsString()
    @MinLength(1)
    title: string;
    
    @IsString()
    @IsOptional()
    slug?: string; 

    @IsString()
    @IsOptional()
    barcode?: string;

    @IsInt()
    @IsPositive()
    precioVenta: number; // Agregamos el campo precioVenta
}
