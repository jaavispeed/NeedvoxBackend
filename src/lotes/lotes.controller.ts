import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from '@nestjs/common';
import { LotesService } from './lotes.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { Lote } from './entities/lotes.entity';
import { User } from 'src/auth/entities/user.entity';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth } from 'src/auth/decorators';

@Controller('lotes')
@Auth()
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

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
  
  
}
