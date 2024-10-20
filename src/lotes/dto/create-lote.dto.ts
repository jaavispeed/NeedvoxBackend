import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateLoteDto {
  @IsString()
  nombreLote: string;

  @IsNumber()
  precioCompra: number;

  @IsNumber()
  precioVenta: number;

  @IsNumber()
  stock: number;

  @IsDateString()
  fechaCaducidad: Date;

  @IsString()
  productId: string; // ID del producto asociado
}
