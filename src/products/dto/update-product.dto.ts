import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {

    @IsString()
    title: string;
  
    @IsNumber()
    @IsOptional()
    @Min(0)
    price?: number;
  
    @IsInt()
    @IsOptional()
    @Min(0)
    stock?: number;

}
