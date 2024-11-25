export declare class UpdateProductVentaDto {
    productId?: string;
    cantidad?: number;
    ventaPrice?: number;
    loteId?: string;
}
export declare class UpdateVentaDto {
    productos?: UpdateProductVentaDto[];
    metodo_pago?: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO';
}
