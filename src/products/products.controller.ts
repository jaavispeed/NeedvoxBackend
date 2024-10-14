import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, ConflictException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from '../auth/entities/user.entity';

@Controller('products')
@Auth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User
  ) {
    // Solo verifica si el código de barras no es nulo ni vacío
    if (createProductDto.barcode) {
      const existingProduct = await this.productsService.findByBarcode(createProductDto.barcode);
      if (existingProduct) {
        throw new ConflictException('Código de barras ya creado.');
      }
    }

    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(@Query() paginationDto:PaginationDto, @GetUser() user: User) 
  {
    return this.productsService.findAll(paginationDto, user);
  }

  @Get(':term')
  findOne(@Param('term') term: string, @GetUser() user:User) 
  {
    return this.productsService.findOne(term, user);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User
  ) {
    // Solo verifica si el código de barras no es nulo ni vacío
    if (updateProductDto.barcode) {
      const existingProduct = await this.productsService.findByBarcode(updateProductDto.barcode);
      if (existingProduct && existingProduct.id !== id) {
        throw new ConflictException('Código de barras ya creado.');
      }
    }

    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.productsService.remove(id, user); // Pasar el usuario al servicio
  }
}
