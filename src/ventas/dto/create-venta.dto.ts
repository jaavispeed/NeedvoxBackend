import { IsArray, IsEnum, IsInt, IsPositive, IsUUID } from 'class-validator';

export class CreateProductVentaDto {
    @IsUUID()
    productId: string;

    @IsInt()
    @IsPositive()
    cantidad: number;

    @IsPositive()
    ventaPrice: number; // Este es el precio unitario durante la venta

    @IsUUID() // Asegúrate de que sea un UUID
    loteId: string; // Añadido para identificar el lote
}

export class CreateVentaDto {
    @IsArray()
    productos: CreateProductVentaDto[];

    @IsUUID()
    userId: string; // Si necesitas incluir el ID del usuario

    // Agregar el campo metodo_pago con validación
    @IsEnum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO'])
    metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO'; 
}
