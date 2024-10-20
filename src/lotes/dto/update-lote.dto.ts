import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class UpdateLoteDto {
  @IsOptional()
  @IsString()
  nombreLote?: string;

  @IsOptional()
  @IsNumber()
  precioCompra?: number;

  @IsOptional()
  @IsNumber()
  precioVenta?: number;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsDateString()
  fechaCaducidad?: Date;

  @IsOptional()
  @IsString()
  productId?: string; // ID del producto asociado
  
}
