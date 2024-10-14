import {
  BadRequestException,
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

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      // Asegurarse de que el barcode es null si está vacío
      const barcode = createProductDto.barcode?.trim() === '' ? null : createProductDto.barcode;

      // Verificar si ya existe un producto con el mismo nombre para el mismo usuario
      const existingProductWithTitle = await this.productRepository.findOne({
        where: { title: createProductDto.title, user: { id: user.id } },
      });

      if (existingProductWithTitle) {
        throw new BadRequestException(`Nombre ya creado: "${createProductDto.title}".`);
      }

      // Verificar si ya existe un producto con el mismo código de barras (si no es null) para el mismo usuario
      if (barcode) {
        const existingProductWithBarcode = await this.productRepository.findOne({
          where: { barcode: barcode, user: { id: user.id } },
        });

        if (existingProductWithBarcode) {
          throw new BadRequestException(`Código de barras ya creado: "${barcode}".`);
        }
      }

      // Crear el producto si no hay duplicados
      const product = this.productRepository.create({
        ...createProductDto,
        barcode, // Asignar barcode como null si está vacío
        user, // Asignar el usuario
      });

      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto, user: User) {
    const { limit = 10, offset = 0 } = paginationDto;

    // Filtrar los productos solo por el usuario autenticado
    return this.productRepository.find({
      where: { user }, // Agregar la condición para que solo se obtengan los productos del usuario
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
          barcode: term, // Para permitir búsqueda por barcode
        })
        .andWhere('user.id = :userId', { userId: user.id }) // Asegurarse que el producto pertenece al usuario
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with term ${term} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    // Asegurarse de que el barcode es null si está vacío
    const barcode = updateProductDto.barcode?.trim() === '' ? null : updateProductDto.barcode;

    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
      barcode, // Asignar barcode como null si está vacío
    });

    if (!product) throw new NotFoundException(`Producto con id: ${id} no encontrado`);

    // Verificar si otro producto del mismo usuario ya tiene ese nombre
    const existingProductWithTitle = await this.productRepository.findOne({
      where: { title: updateProductDto.title, user: { id: user.id } },
    });

    if (existingProductWithTitle && existingProductWithTitle.id !== id) {
      throw new BadRequestException(`Nombre ya creado: "${updateProductDto.title}".`);
    }

    // Verificar si otro producto del mismo usuario ya tiene ese código de barras (si no es null)
    if (barcode) {
      const existingProductWithBarcode = await this.productRepository.findOne({
        where: { barcode: barcode, user: { id: user.id } },
      });

      if (existingProductWithBarcode && existingProductWithBarcode.id !== id) {
        throw new BadRequestException(`Código de barras ya creado: "${barcode}".`);
      }
    }

    try {
      product.user = user; // Actualizar el usuario
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string, user: User) {
    const product = await this.findOne(id, user); // Pasar el usuario al método findOne
    await this.productRepository.remove(product);
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

  async findByBarcode(barcode: string) {
    return await this.productRepository.findOne({ where: { barcode } });
  }
}
