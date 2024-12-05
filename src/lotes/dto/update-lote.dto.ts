import { IsNumber, IsDateString, IsOptional, IsPositive } from 'class-validator';

export class UpdateLoteDto {

  @IsOptional()
  @IsPositive()
  @IsNumber()
  precioCompra?: number;

  @IsOptional()
  @IsPositive()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsDateString()
  fechaCaducidad?: Date;
  
}
