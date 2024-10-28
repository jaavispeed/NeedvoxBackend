import { forwardRef, Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { AuthModule } from 'src/auth/auth.module';
import { LotesModule } from 'src/lotes/lotes.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Product]),
    forwardRef(() => LotesModule), // Usa forwardRef aquí si es necesario
  ],
  exports: [ProductsService], // Exporta el servicio si es necesario
})
export class ProductsModule {}
