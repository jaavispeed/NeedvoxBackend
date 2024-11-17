import { IsEnum, IsInt, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class UpdateProductVentaDto {
    @IsOptional()
    @IsUUID()
    productId?: string;

    @IsOptional()
    @IsInt()
    @IsPositive()
    cantidad?: number;

    @IsOptional()
    @IsPositive()
    ventaPrice?: number; // Este es el precio unitario durante la venta

    @IsOptional()
    @IsUUID() // Asegúrate de que sea un UUID
    loteId?: string; // Añadido para permitir la actualización del lote
}

export class UpdateVentaDto {
    @IsOptional()
    productos?: UpdateProductVentaDto[];

    // Agregar el campo metodo_pago con validación
    @IsOptional()
    @IsEnum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO'])
    metodo_pago?: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO'; 
}
