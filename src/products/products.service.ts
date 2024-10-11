import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID} from 'uuid';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  
  private readonly logger = new Logger('ProductService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ){}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      // Verificar si ya existe un producto con el mismo nombre para el mismo usuario
      const existingProduct = await this.productRepository.findOne({
        where: {
          title: createProductDto.title,
          user: { id: user.id } // Asegúrate de que se está buscando solo para el mismo usuario
        }
      });
  
      if (existingProduct) {
        throw new BadRequestException(`Ya tienes un producto con el nombre "${createProductDto.title}".`);
      }
  
      // Crear el producto si no hay duplicados
      const product = this.productRepository.create({
        ...createProductDto,
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
        .where('UPPER(title) = :title or slug = :slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
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
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });
  
    if (!product) throw new NotFoundException(`Producto con id: ${id} no encontrado`);
  
    // Verificar si otro producto del mismo usuario ya tiene ese nombre
    const existingProduct = await this.productRepository.findOne({
      where: {
        title: updateProductDto.title,
        user: { id: user.id } // Solo verificar para el mismo usuario
      }
    });
  
    // Asegúrate de que no estás verificando el mismo producto
    if (existingProduct && existingProduct.id !== id) {
      throw new BadRequestException(`Ya tienes otro producto con el nombre "${updateProductDto.title}".`);
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
  

  private handleDBExceptions(error:any){

    if(error.code === '23505')
    throw new BadRequestException(error.detail);

    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

}
