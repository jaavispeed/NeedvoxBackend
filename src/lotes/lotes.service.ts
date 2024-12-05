import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { Lote } from './entities/lotes.entity';
import { User } from 'src/auth/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class LotesService {
  private readonly logger = new Logger('LotesService');

  constructor(
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @Inject(forwardRef(() => ProductsService)) // Usa forwardRef aquí
    private readonly productsService: ProductsService,

  ) { }

  async create(createLoteDto: CreateLoteDto, user: User): Promise<Lote> {
    const product = await this.productRepository.findOne({ where: { id: createLoteDto.productId } });

    if (!product) {
      throw new NotFoundException('Producto no encontrado.');
    }

    const fechaCaducidad = createLoteDto.fechaCaducidad || null;

    const lote = this.loteRepository.create({
      ...createLoteDto,
      fechaCaducidad,
      producto: product, // Asociar producto
      user,
    });

    // El precioVenta se toma directamente del producto, no del lote
    lote.precioCompra = createLoteDto.precioCompra;  // Mantener precioCompra

    const savedLote = await this.loteRepository.save(lote);

    // Recalcular el stock total del producto
    product.stockTotal = await this.productsService.calculateTotalStock(product.id, user);
    await this.productRepository.save(product);

    return savedLote;
  }



  async findAll(paginationDto: PaginationDto, user: User): Promise<Lote[]> {
    return await this.loteRepository.find({
      where: { user }, // Puedes filtrar si es necesario
      relations: ['producto'], // Incluir la relación con el producto
    });
  }
  

  async findOne(id: string, user: User): Promise<Lote> {
    const lote = await this.loteRepository.findOne({ where: { id, user } });

    if (!lote) {
      throw new NotFoundException('Lote no encontrado o no pertenece al usuario.');
    }

    return lote;
  }

  async update(id: string, updateLoteDto: UpdateLoteDto, user: User): Promise<Lote> {
    const lote = await this.loteRepository.findOne({ where: { id, user }, relations: ['producto'] });

    if (!lote) {
      throw new NotFoundException('Lote no encontrado.');
    }

    if (updateLoteDto.fechaCaducidad === null) {
      lote.fechaCaducidad = null;
    } else if (updateLoteDto.fechaCaducidad) {
      lote.fechaCaducidad = updateLoteDto.fechaCaducidad;
    }

    // Elimina la línea que intenta acceder a `precioVenta` en el Lote
    lote.precioCompra = updateLoteDto.precioCompra ?? lote.precioCompra;
    lote.stock = updateLoteDto.stock ?? lote.stock;

    const updatedLote = await this.loteRepository.save(lote);

    // Recalcular el stock total del producto
    const product = lote.producto;
    product.stockTotal = await this.productsService.calculateTotalStock(product.id, user);
    await this.productRepository.save(product);

    return updatedLote;
  }


  async remove(id: string, user: User): Promise<void> {
    const lote = await this.loteRepository.findOne({
      where: { id, user },
      relations: ['producto'] // Asegúrate de incluir la relación
    });

    if (!lote) {
      throw new NotFoundException('Lote no encontrado.');
    }

    // Asegúrate de que lote.producto esté definido
    if (!lote.producto) {
      throw new NotFoundException('El lote no tiene un producto asociado.');
    }

    // Eliminar el lote
    await this.loteRepository.remove(lote);

    // Recalcular el stock total del producto
    const product = lote.producto; // Ya está cargado
    product.stockTotal = await this.productsService.calculateTotalStock(product.id, user);

    // Guardar el producto actualizado
    await this.productRepository.save(product);
  }



  async findAllByUser(user: User): Promise<Lote[]> {
    return await this.loteRepository.find({ where: { user } });
  }

  async findAllByProductAndUser(productId: string, user: User): Promise<Lote[]> {
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException('Producto no encontrado.');
    }

    const lotes = await this.loteRepository.find({
      where: {
        producto: product,
        user,
      },
      relations: ['producto'],  // Asegúrate de incluir la relación aquí
    });

    console.log(`Lotes obtenidos en findAllByProductAndUser para producto ${productId}:`, lotes);
    return lotes;
  }



  async findAllByProduct(productId: string, user: User): Promise<Lote[]> {
    console.log(`Buscando lotes para el producto con ID: ${productId}`);
  
    const lotes = await this.loteRepository.find({
      where: {
        producto: { id: productId },
        user: user,  // Verifica que el usuario también se esté considerando si es necesario
      },
      relations: ['producto'], // Asegúrate de cargar la relación de 'producto'
    });
  
    console.log(`Lotes encontrados:`, lotes);
    return lotes;
  }
  
  
  async obtenerEstadisticas(user: User) {
    try {
      // Obtención de estadísticas por día (precioCompra y cantidad)
      const gastosDia = await this.loteRepository
        .createQueryBuilder('lote')
        .select('SUM(lote.precioCompra)', 'totalCompra')
        .addSelect('COUNT(lote.id)', 'cantidad')
        .where('lote.userId = :userId', { userId: user.id })
        .andWhere("DATE(lote.fechaCreacion) = CURRENT_DATE")
        .getRawOne();

      // Obtención de estadísticas por mes (precioCompra y cantidad)
      const gastosMes = await this.loteRepository
        .createQueryBuilder('lote')
        .select('SUM(lote.precioCompra)', 'totalCompra')
        .addSelect('COUNT(lote.id)', 'cantidad')
        .where('lote.userId = :userId', { userId: user.id })
        .andWhere("EXTRACT(MONTH FROM lote.fechaCreacion) = EXTRACT(MONTH FROM CURRENT_DATE)")
        .andWhere("EXTRACT(YEAR FROM lote.fechaCreacion) = EXTRACT(YEAR FROM CURRENT_DATE)")
        .getRawOne();

      // Obtención de estadísticas por año (precioCompra y cantidad)
      const gastosAnio = await this.loteRepository
        .createQueryBuilder('lote')
        .select('SUM(lote.precioCompra)', 'totalCompra')
        .addSelect('COUNT(lote.id)', 'cantidad')
        .where('lote.userId = :userId', { userId: user.id })
        .andWhere("EXTRACT(YEAR FROM lote.fechaCreacion) = EXTRACT(YEAR FROM CURRENT_DATE)")
        .getRawOne();

      return {
        gastosDia: {
          totalCompra: gastosDia?.totalCompra || 0,
          cantidad: gastosDia?.cantidad || 0,
        },
        gastosMes: {
          totalCompra: gastosMes?.totalCompra || 0,
          cantidad: gastosMes?.cantidad || 0,
        },
        gastosAnio: {
          totalCompra: gastosAnio?.totalCompra || 0,
          cantidad: gastosAnio?.cantidad || 0,
        },
      };
    } catch (error) {
      this.logger.error('Error al obtener estadísticas', error.stack);
      throw new Error('Error interno al calcular estadísticas.');
    }
  }


}
