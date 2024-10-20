import {
    Body,
    Controller,
    Post,
    UseGuards,
    Request,
    Patch,
    Param,
    Delete,
    Get,
    BadRequestException,
    Req,
  } from '@nestjs/common';
  import { CreateVentaDto } from './dto/create-venta.dto';
  import { VentasService } from './ventas.service';
  import { Auth } from 'src/auth/decorators'; // Asegúrate de que este decorador esté correctamente implementado
  import { User } from 'src/auth/entities/user.entity';
  import { UpdateVentaDto } from './dto/update-venta.dto';
  import { ProductVenta, Venta } from './entities/ventas.entity';
  import { ProductventaService } from './productventa.service';
  
  @Controller('ventas')
  @Auth()
  export class VentasController {
    constructor(
      private readonly ventasService: VentasService,
      private readonly productVentaService: ProductventaService,
    ) {}
  
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
    ): Promise<{ venta: Venta }> {
      const user: User = req.user; // Obtén el usuario desde el objeto de solicitud
      return this.ventasService.update(id, updateVentaDto, user);
    }
  
    @Auth()
    @Delete(':id') // Agrega este método para eliminar una venta
    async remove(@Param('id') id: string, @Request() req): Promise<void> {
      const user: User = req.user; // Obtén el usuario desde el objeto de solicitud
      return this.ventasService.remove(id, user);
    }
  
    @Get('fecha/:date')
  @Auth() // Asegúrate de que el usuario esté autenticado
  async findByDate(@Param('date') date: string, @Request() req): Promise<Venta[]> {
    const user: User = req.user; // Obtén el usuario autenticado desde la solicitud
    console.log('Usuario autenticado:', user);
    return await this.ventasService.findByDate(date, user);
  }
    
    
  
    @Auth()
    @Get()
    async findAll(@Request() req): Promise<Venta[]> {
      const user: User = req.user; // Obtén el usuario desde el objeto de solicitud
      return await this.ventasService.findAll(user);
    }
  
    // Métodos para manejar ProductVenta
    @Get('product-venta')
    async obtenerTodos(): Promise<ProductVenta[]> {
      return this.productVentaService.obtenerTodos();
    }
  
    @Get('product-venta/:id')
    async obtenerPorId(@Param('id') id: string): Promise<ProductVenta> {
      return this.productVentaService.obtenerPorId(id);
    }
  }
  