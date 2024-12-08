export declare class CreateProductVentaDto {
    productId: string;
    cantidad: number;
    ventaPrice: number;
    loteId: string;
}
export declare class CreateVentaDto {
    productos: CreateProductVentaDto[];
    userId: string;
    metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO';
}
