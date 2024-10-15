import { Body, Controller, Post, UseGuards, Request, Patch, Param, Delete, Get, Query } from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import { VentasService } from './ventas.service';
import { Auth } from 'src/auth/decorators'; // Asegúrate de que este decorador esté correctamente implementado
import { User } from 'src/auth/entities/user.entity';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Venta } from './entities/ventas.entity';

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Auth() // Aplica el guardia de autenticación
  @Post()
  async create(@Body() createVentaDto: CreateVentaDto, @Request() req) {
    const user: User = req.user; // Obtén el usuario desde el objeto de solicitud
    return this.ventasService.create(createVentaDto, user);
  }

  @Auth() // Aplica el guardia de autenticación
  @Patch(':id')
  async update(
      @Param('id') id: string,
      @Body() updateVentaDto: UpdateVentaDto,
      @Request() req // Accede al objeto de solicitud
  ): Promise<{ venta: Venta; stock: number }> {
      const user: User = req.user; // Obtén el usuario desde el objeto de solicitud
      return await this.ventasService.update(id, updateVentaDto, user);
  }

  @Auth()
  @Delete(':id') // Agrega este método para eliminar una venta
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    const user: User = req.user; // Obtén el usuario desde el objeto de solicitud
    return this.ventasService.remove(id, user);
  }

  @Auth()
  @Get('fecha/:date')
  async findByDate(@Param('date') date: string, @Request() req) {
      const user: User = req.user; // Obtén el usuario desde el objeto de solicitud
      return await this.ventasService.findByDate(date, user);
  }
  

  
}
