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
    await this.productsService.updateStockTotal(product.id, user); // Asegúrate de pasar el usuario

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
    const lote = await this.loteRepository.preload({ id, user, ...updateLoteDto });

    if (!lote) {
      throw new NotFoundException('Lote no encontrado o no pertenece al usuario');
    }

    return this.loteRepository.save(lote);
  }

  async remove(id: string, user: User): Promise<void> {
    const lote = await this.findOne(id, user);
    
    await this.loteRepository.remove(lote);
    this.logger.log(`Lote con id ${id} ha sido eliminado exitosamente.`);
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
    return await this.loteRepository.find({
        where: { user, producto: { id: productId } },
    });
}

}
