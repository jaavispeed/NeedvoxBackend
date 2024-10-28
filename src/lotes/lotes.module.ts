// lotes.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { LotesController } from './lotes.controller';
import { LotesService } from './lotes.service';
import { Lote } from './entities/lotes.entity';
import { Product } from 'src/products/entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  controllers: [LotesController],
  providers: [LotesService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Lote, Product]),
    forwardRef(() => ProductsModule), // Usa forwardRef aquí
  ],
  exports: [LotesService], // Asegúrate de exportar LotesService
})
export class LotesModule {}
