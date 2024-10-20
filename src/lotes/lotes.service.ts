import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { Lote } from './entities/lotes.entity';
import { User } from 'src/auth/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class LotesService {
    private readonly logger = new Logger('LotesService');
  constructor(
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createLoteDto: CreateLoteDto, user: User): Promise<Lote> {
    const product = await this.productRepository.findOne({ where: { id: createLoteDto.productId } });

    if (!product) {
      throw new NotFoundException('Producto no encontrado.');
    }

    const lote = this.loteRepository.create({
      nombreLote: createLoteDto.nombreLote,
      precioCompra: createLoteDto.precioCompra,
      precioVenta: createLoteDto.precioVenta,
      stock: createLoteDto.stock,
      fechaCaducidad: createLoteDto.fechaCaducidad,
      producto: product,
      user: user, // Asocia el lote al usuario
    });

    return await this.loteRepository.save(lote);
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
    const lote = await this.loteRepository.findOne({ where: { id, user: { id: user.id } } });
    if (!lote) {
      throw new NotFoundException('Lote no encontrado o no pertenece al usuario');
    }

    Object.assign(lote, updateLoteDto);
    return this.loteRepository.save(lote);
  }

  async remove(id: string, user: User): Promise<void> {
    const lote = await this.findOne(id, user);
    
    if (!lote) {
      this.logger.warn(`Intento de eliminar lote con id ${id} fallido: Lote no encontrado.`);
      throw new NotFoundException(`Lote con id ${id} no encontrado.`);
    }

    await this.loteRepository.remove(lote);
    this.logger.log(`Lote con id ${id} ha sido eliminado exitosamente.`);
  }


  async findAllByUser(user: User): Promise<Lote[]> {
    return await this.loteRepository.find({ where: { user } });
  }
  

}
