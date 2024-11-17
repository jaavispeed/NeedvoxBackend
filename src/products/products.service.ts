import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { User } from 'src/auth/entities/user.entity';
import { LotesService } from 'src/lotes/lotes.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,



    @Inject(forwardRef(() => LotesService))
    private readonly lotesService: LotesService,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const barcode = createProductDto.barcode?.trim() === '' || createProductDto.barcode === 'Sin código de barras' ? null : createProductDto.barcode;
  
      // Verificar si ya existe un producto con el mismo nombre para este usuario
      const existingProductWithTitle = await this.findByName(createProductDto.title, user);
      if (existingProductWithTitle) {
        throw new BadRequestException('Nombre ya creado para este usuario.');
      }
  
      // Verificar si ya existe un producto con el mismo código de barras para este usuario (solo si el código de barras no está vacío)
      if (barcode) {
        const existingProductWithBarcode = await this.findByBarcodeAndUser(barcode, user);
        if (existingProductWithBarcode) {
          throw new BadRequestException('Código de barras ya creado para este usuario.');
        }
      }
  
      const product = this.productRepository.create({
        ...createProductDto,
        barcode,
        user,
      });
  
      await this.productRepository.save(product);
  
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
  

  async findAll(paginationDto: PaginationDto, user: User) {
    const { limit = 10, offset = 0 } = paginationDto;
  
    const products = await this.productRepository.find({
      where: { user },
      take: limit + 1, // Pedimos un producto extra para saber si hay más
      skip: offset,    // Desplazamiento correcto
      order: {
        fechaCreacion: 'DESC', // Ordenamos por fechaCreacion de forma descendente
      },
    });
  
    const hasMore = products.length > limit;
  
    if (hasMore) products.pop(); // Elimina el producto extra
  
    return {
      data: products,
      hasMore,
    };
  }
  
  
  
  
  
  

  async findOne(term: string, user: User) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOne({ where: { id: term, user } });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('UPPER(title) = :title OR slug = :slug OR barcode = :barcode', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
          barcode: term,
        })
        .andWhere('user.id = :userId', { userId: user.id })
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Producto con el término ${term} no encontrado.`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const barcode = updateProductDto.barcode?.trim() === '' || updateProductDto.barcode === 'Sin código de barras' ? null : updateProductDto.barcode;

    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
      barcode,
    });

    if (!product) throw new NotFoundException(`Producto con id: ${id} no encontrado.`);

    // Validar si existe un producto con el mismo nombre para este usuario
    const existingProductWithTitle = await this.findByName(updateProductDto.title, user);
    if (existingProductWithTitle && existingProductWithTitle.id !== id) {
      throw new BadRequestException('Nombre ya creado para este usuario.');
    }

    // Validar si existe un producto con el mismo código de barras para este usuario
    if (barcode) {
      const existingProductWithBarcode = await this.findByBarcodeAndUser(barcode, user);
      if (existingProductWithBarcode && existingProductWithBarcode.id !== id) {
        throw new BadRequestException('Código de barras ya creado para este usuario.');
      }
    }

    // Guardar el producto actualizado
    const updatedProduct = await this.productRepository.save(product);

    // Calcular el stock total
    const stockTotal = await this.calculateTotalStock(id, user); // Asegúrate de tener este método implementado

    // Actualizar el producto con el nuevo stock total
    updatedProduct.stockTotal = stockTotal;
    return await this.productRepository.save(updatedProduct);
}

async calculateTotalStock(productId: string, user: User): Promise<number> {
  // Asegúrate de que el servicio de lotes esté inyectado
  const lotes = await this.lotesService.findAllByProduct(productId, user);

  // Sumar el stock total de los lotes
  return lotes.reduce((total, lote) => total + lote.stock, 0);
}




async remove(id: string, user: User): Promise<Product | null> {
  const product = await this.productRepository.findOne({ where: { id, user } });
  
  if (!product) {
      throw new NotFoundException('Producto no encontrado.');
  }

  // Antes de eliminar el producto, recalcula el stock total
  const stockTotal = await this.calculateTotalStock(product.id, user);
  product.stockTotal = stockTotal; // Actualiza el stock total en el producto

  // Elimina el producto
  await this.productRepository.remove(product);
  return product; // Devuelve el producto que fue eliminado
}



  private handleDBExceptions(error: any) {
    if (error.code === '23505') { // Código de error para violaciones de unicidad en PostgreSQL
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

  async findByBarcodeAndUser(barcode: string, user: User): Promise<Product | undefined> {
    return await this.productRepository.findOne({
      where: {
        barcode,
        user, // Relación con la entidad User
      },
    });
  }

  async findByName(title: string, user: User) {
    const lowerTitle = title.toLowerCase();
    
    return await this.productRepository
      .createQueryBuilder('product')
      .where('LOWER(product.title) = :title', { title: lowerTitle })
      .andWhere('product.user.id = :userId', { userId: user.id })
      .getOne();
  }

  async countByUser(userId: string): Promise<number> {
    const count = await this.productRepository.count({ where: { user: { id: userId } } });
    console.log(`Cantidad de productos para el usuario ${userId}: ${count}`);
    return count;
  }

  findAllAdmin(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
  
    return this.productRepository.find({
      take: limit,
      skip: offset,
    });
  }
}
