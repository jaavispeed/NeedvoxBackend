import { IsString, IsNumber, IsDateString, IsPositive, IsOptional } from 'class-validator';

export class CreateLoteDto {
  @IsPositive()
  @IsNumber()
  precioCompra: number;

  @IsPositive()
  @IsNumber()
  stock: number; // Mantener este campo, ya que es importante para el lote

  @IsOptional() // Es opcional, no se valida si está ausente
  @IsDateString() // Validamos que sea una fecha cuando se proporciona
  fechaCaducidad?: Date | null; // Puede ser null o Date

  @IsString()
  productId: string; // ID del producto asociado
}
