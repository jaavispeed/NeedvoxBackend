import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { Lote } from './entities/lotes.entity';
import { User } from 'src/auth/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class LotesService {
  private readonly logger = new Logger('LotesService');

  constructor(
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @Inject(forwardRef(() => ProductsService)) // Usa forwardRef aquí
    private readonly productsService: ProductsService,

  ) {}

  async create(createLoteDto: CreateLoteDto, user: User): Promise<Lote> {
    const product = await this.productRepository.findOne({ where: { id: createLoteDto.productId } });

    if (!product) {
        throw new NotFoundException('Producto no encontrado.');
    }

    const lote = this.loteRepository.create({
        ...createLoteDto,
        producto: product,
        user, // Asocia el lote al usuario
    });

    const savedLote = await this.loteRepository.save(lote);

    // Actualiza el stock total del producto
    const stockTotal = await this.productsService.calculateTotalStock(product.id, user);
    product.stockTotal = stockTotal; // Actualiza el stockTotal en el objeto producto

    await this.productRepository.save(product); // Guarda el producto actualizado

    return savedLote;
}



  async findAll(paginationDto: PaginationDto, user: User): Promise<Lote[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    return await this.loteRepository.find({
      where: { user }, // Filtra lotes por el usuario
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string, user: User): Promise<Lote> {
    const lote = await this.loteRepository.findOne({ where: { id, user } });

    if (!lote) {
      throw new NotFoundException('Lote no encontrado o no pertenece al usuario.');
    }

    return lote;
  }

  async update(id: string, updateLoteDto: UpdateLoteDto, user: User): Promise<Lote> {
    const lote = await this.loteRepository.findOne({ where: { id, user }, relations: ['producto'] });

    if (!lote) {
        throw new NotFoundException('Lote no encontrado.');
    }

    // Actualiza el lote con los nuevos datos
    const updatedLote = await this.loteRepository.save({
        ...lote,
        ...updateLoteDto,
    });

    // Asegúrate de que el producto esté correctamente asociado
    if (!lote.producto) {
        throw new NotFoundException('El lote no tiene un producto asociado.');
    }

    // Recalcula el stock total del producto
    const product = lote.producto; // Usa el producto que ya tienes
    product.stockTotal = await this.productsService.calculateTotalStock(product.id, user);

    // Guarda el producto actualizado
    await this.productRepository.save(product);

    return updatedLote;
}





  async remove(id: string, user: User): Promise<void> {
    const lote = await this.loteRepository.findOne({ where: { id, user } });

    if (!lote) {
        throw new NotFoundException('Lote no encontrado.');
    }

    // Obtén el producto asociado
    const product = await this.productRepository.findOne({ where: { id: lote.producto.id } });

    if (!product) {
        throw new NotFoundException('Producto asociado no encontrado.');
    }

    // Eliminar el lote
    await this.loteRepository.remove(lote);

    // Recalcular el stock total del producto
    product.stockTotal = await this.productsService.calculateTotalStock(product.id, user);

    // Guardar el producto actualizado
    await this.productRepository.save(product);
}





  async findAllByUser(user: User): Promise<Lote[]> {
    return await this.loteRepository.find({ where: { user } });
  }

  async findAllByProductAndUser(productId: string, user: User): Promise<Lote[]> {
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
        throw new NotFoundException('Producto no encontrado.');
    }

    // Busca lotes asociados al producto y al usuario
    const lotes = await this.loteRepository.find({
        where: {
            producto: product,
            user,
        },
    });

    console.log(`Lotes obtenidos en findAllByProductAndUser para producto ${productId}:`, lotes); // Log para verificar lotes

    return lotes;
}


async findAllByProduct(productId: string, user: User): Promise<Lote[]> {
  console.log(`Buscando lotes para productId: ${productId} y userId: ${user.id}`);
  
  try {
      const lotes = await this.loteRepository.find({
          where: { user, producto: { id: productId } }, // Cambia 'product' a 'producto'
      });

      console.log(`Lotes encontrados:`, lotes);
      return lotes;
  } catch (error) {
      console.error('Error al buscar lotes:', error);
      throw new Error('No se pudieron encontrar los lotes.');
  }
}



}
