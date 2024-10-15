import { IsInt, IsOptional, IsPositive, IsNumber, IsUUID } from 'class-validator';

export class UpdateVentaDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  cantidad?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  ventaPrice?: number;
}
