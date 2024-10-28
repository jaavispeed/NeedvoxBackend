import { IsString, IsNumber, IsDateString, IsPositive } from 'class-validator';

export class CreateLoteDto {
  @IsPositive()
  @IsNumber()
  precioCompra: number;

  @IsPositive()
  @IsNumber()
  precioVenta: number;

  @IsPositive()
  @IsNumber()
  stock: number; // Mantener este campo, ya que es importante para el lote

  @IsDateString()
  fechaCaducidad: Date;

  @IsString()
  productId: string; // ID del producto asociado
}
