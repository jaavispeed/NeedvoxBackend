import { IsInt, IsNumber, IsOptional, IsPositive, IsString, Min, MinLength, IsDateString } from "class-validator";

export class CreateProductDto {
    @IsString()
    @MinLength(1)
    title: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    compraPrice?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    ventaPrice?: number;

    @IsString()
    @IsOptional()
    slug?: string; 
    
    @IsInt()
    @IsOptional()
    @Min(0)
    stock?: number;

    @IsDateString()
    @IsOptional()
    expiryDate?: string; // Añadido como opcional
}
