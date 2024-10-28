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
  
      const product = this.productRepository.create({
        ...createProductDto,
        barcode,
        user,
      });
  
      await this.productRepository.save(product);
  
      // Llama a la función para calcular y actualizar el stock total después de crear el producto
      await this.updateStockTotal(product.id, user);
  
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto, user: User) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.productRepository.find({
      where: { user },
      take: limit,
      skip: offset,
    });
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
    return await this.productRepository.save(product);
  }

  async remove(id: string, user: User) {
    const product = await this.findOne(id, user);
    await this.productRepository.remove(product);
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
  
  async updateStockTotal(productId: string, user: User): Promise<void> {
    const totalStock = await this.calculateTotalStock(productId, user);
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
        throw new NotFoundException('Producto no encontrado.');
    }

    product.stockTotal = totalStock; // Actualiza el stock total
    console.log(`Actualizando stockTotal de producto ${productId} a ${totalStock}`); // Verifica que se esté actualizando
    await this.productRepository.save(product);
    console.log(`Stock total actualizado en la base de datos para el producto ${productId}`); // Confirma la actualización
}









async calculateTotalStock(productId: string, user: User): Promise<number> {
  const lotes = await this.lotesService.findAllByProductAndUser(productId, user);
  
  // Log para verificar los lotes recuperados
  console.log(`Lotes encontrados para el producto ${productId}:`, lotes);
  
  // Si no se recuperan lotes, deberías ver un mensaje claro aquí
  if (lotes.length === 0) {
      console.log(`No se encontraron lotes para el producto ${productId}`);
  }

  const totalStock = lotes.reduce((total, lote) => total + lote.stock, 0);
  console.log(`Total stock calculado para el producto ${productId}: ${totalStock}`);
  
  return totalStock;
}



}
