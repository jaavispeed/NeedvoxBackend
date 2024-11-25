import { PaginationDto } from '../common/dtos/pagination.dto';

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from '../auth/entities/user.entity';
import { Lote } from 'src/lotes/entities/lotes.entity';
import { LotesService } from 'src/lotes/lotes.service';

@Controller('products')
@Auth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService, private readonly lotesService: LotesService) {}

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User
  ) {
    console.log('Intentando crear producto con:', createProductDto); // Log para depurar
    try {
      const product = await this.productsService.create(createProductDto, user);
      
      // No es necesario calcular ni actualizar stockTotal
      return product; // Devuelve el producto creado
    } catch (error) {
      console.error('Error al crear producto:', error); // Log de error
      if (error.message.includes('Nombre ya creado')) {
        throw new ConflictException('El nombre del producto ya existe.');
      } else if (error.message.includes('Código de barras ya creado')) {
        throw new ConflictException('El código de barras ya existe.');
      }
      throw new BadRequestException('Error al crear el producto. Verifica los datos ingresados.');
    }
  }
  

  @Get()
  findAll(@Query() paginationDto: PaginationDto, @GetUser() user: User) {
    return this.productsService.findAll(paginationDto, user);
  }

  @Get('/productAdmin')
  findAllAdmin(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAllAdmin(paginationDto);
  }

  @Get(':term')
  async findOne(@Param('term') term: string, @GetUser() user: User) {
    return await this.productsService.findOne(term, user);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User
  ) {
    try {
      // Actualiza el producto con los datos proporcionados
      const product = await this.productsService.update(id, updateProductDto, user);
      
      // No es necesario calcular ni actualizar stockTotal
      return product; // Devuelve el producto actualizado
    } catch (error) {
      // Propagar la excepción original
      if (error instanceof BadRequestException) {
        throw error; // Mantener el mensaje de error original
      }
      if (error.message.includes('Nombre ya creado')) {
        throw new ConflictException('El nombre del producto ya existe.');
      } else if (error.message.includes('Código de barras ya creado')) {
        throw new ConflictException('El código de barras ya existe.');
      }
      throw new BadRequestException('Error al actualizar el producto. Verifica los datos ingresados.');
    }
  }
  
  

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    const deletedProduct = await this.productsService.remove(id, user);
    
    // Verificamos si deletedProduct es nulo
    if (!deletedProduct) {
      throw new NotFoundException('Producto no encontrado.');
    }
  
    return {
      message: 'Producto eliminado con éxito.',
      id: deletedProduct.id, // También puedes devolver el id del producto eliminado si es necesario
    };
  }
  
  

  @Get('name/:name')
  async findByName(@Param('name') name: string, @GetUser() user: User) {
    return await this.productsService.findByName(name, user);
  }

  @Get('count/:userId')
  async countProductsByUser(@Param('userId') userId: string): Promise<number> {
    const count = await this.productsService.countByUser(userId);
    return count;
  }

  @Get('producto/:id')
async findAllByProduct(
    @Param('id') productId: string,
    @GetUser() user: User
): Promise<{ lotes: Lote[]; stockTotal: number }> {
    console.log(`Buscando lotes para el producto: ${productId} y usuario: ${user.id}`);
    
    // Obtiene los lotes desde el servicio
    const lotes = await this.lotesService.findAllByProduct(productId, user);

    // Sumar el stock total de los lotes
    const stockTotal = lotes.reduce((total, lote) => total + lote.stock, 0);

    // Log del stock total calculado
    console.log(`Stock total calculado para el producto ${productId}: ${stockTotal}`);

    // Log para mostrar los lotes encontrados
    console.log(`Lotes encontrados para el producto ${productId}:`, lotes);

    // Actualizar el stockTotal del producto
    await this.productsService.update(productId, { stockTotal }, user);

    return { lotes, stockTotal };
}


}
