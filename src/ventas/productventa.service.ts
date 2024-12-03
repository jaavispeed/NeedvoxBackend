// product-venta.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVenta } from './entities/ventas.entity';

@Injectable()
export class ProductventaService {
  constructor(
    @InjectRepository(ProductVenta)
    private readonly productVentaRepository: Repository<ProductVenta>,
  ) { }

  async obtenerTodos(): Promise<ProductVenta[]> {
    return this.productVentaRepository.find({ relations: ['product', 'venta'] }); // Obtener todas las relaciones
  }

  async obtenerPorId(id: string): Promise<ProductVenta> {
    return this.productVentaRepository.findOne({
      where: { id }, // Especifica la condición de búsqueda aquí
      relations: ['product', 'venta'], // Relaciones que quieres cargar
    });
  }
}
