import { Module } from '@nestjs/common';
import { VentasController } from './ventas.controller'; // Ahora este controlador maneja ambas funcionalidades
import { VentasService } from './ventas.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVenta, Venta } from './entities/ventas.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/auth/entities/user.entity';
import { ProductventaService } from './productventa.service';
import { Lote } from 'src/lotes/entities/lotes.entity';

@Module({
  providers: [VentasService, ProductventaService],
  controllers: [VentasController], // Solo el controlador combinado aquí
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Venta, Product, User, ProductVenta, Lote])
  ]
})
export class VentasModule {}
