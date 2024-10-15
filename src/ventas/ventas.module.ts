import { Module } from '@nestjs/common';
import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entities/ventas.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/auth/entities/user.entity';

@Module({
  providers: [VentasService],
  controllers: [VentasController],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Venta, Product, User])
  ]
})
export class VentasModule {}
