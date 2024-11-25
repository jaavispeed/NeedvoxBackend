import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from '@nestjs/common';
import { LotesService } from './lotes.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { Lote } from './entities/lotes.entity';
import { User } from 'src/auth/entities/user.entity';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { PaginationDto } from '../../common/dtos/pagination.dto';

import { Auth } from 'src/auth/decorators';
import { ProductsService } from 'src/products/products.service';

@Controller('lotes')
@Auth()
export class LotesController {
  constructor(private readonly lotesService: LotesService, private readonly productsService: ProductsService) {}

  @Get('estadisticas')
  async obtenerEstadisticas(
    @GetUser() user: User,
    @Query('tipo') tipo: 'dia' | 'mes' | 'año' // Tipo de agrupación: día, mes, año
  ): Promise<any> {
    return this.lotesService.obtenerEstadisticas(user, tipo);
  }

  @Post()
  async create(@Body() createLoteDto: CreateLoteDto, @GetUser() user: User): Promise<Lote> {
    return this.lotesService.create(createLoteDto, user);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @GetUser() user: User): Promise<Lote[]> {
    return this.lotesService.findAll(paginationDto, user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user: User): Promise<Lote> {
    return this.lotesService.findOne(id, user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLoteDto: UpdateLoteDto, @GetUser() user: User): Promise<Lote> {
    return this.lotesService.update(id, updateLoteDto, user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.lotesService.remove(id, user);
  }

  @Get('user')
  async findAllByUser(@GetUser() user: User): Promise<Lote[]> {
    return this.lotesService.findAllByUser(user);
  }

  @Get('producto/:id')
  async findAllByProduct(@Param('id') productId: string, @GetUser() user: User): Promise<{ lotes: Lote[]; stockTotal: number }> {
      console.log(`Buscando lotes para el producto: ${productId} y usuario: ${user.id}`);
      
      // Llamando al servicio para obtener los lotes
      const lotes = await this.lotesService.findAllByProduct(productId, user);
  
      // Sumar el stock total de los lotes
      const stockTotal = lotes.reduce((total, lote) => total + lote.stock, 0);
  
      // Log del stock total calculado
      console.log(`Stock total calculado para el producto ${productId}: ${stockTotal}`);
  
      // Log para mostrar los lotes encontrados
      console.log(`Lotes encontrados para el producto ${productId}:`, lotes);
      
      return { lotes, stockTotal };
  }
    
}
