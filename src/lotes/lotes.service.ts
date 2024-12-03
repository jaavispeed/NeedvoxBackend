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

  ) {}

  async create(createLoteDto: CreateLoteDto, user: User): Promise<Lote> {
    // Busca el producto asociado al ID
    const product = await this.productRepository.findOne({ where: { id: createLoteDto.productId } });

    // Si no se encuentra el producto, lanza una excepción
    if (!product) {
        throw new NotFoundException('Producto no encontrado.');
    }

    // Si no se proporciona fechaCaducidad, asigna null
    const fechaCaducidad = createLoteDto.fechaCaducidad ? createLoteDto.fechaCaducidad : null;

    // Crea el objeto de lote con los datos proporcionados
    const lote = this.loteRepository.create({
        ...createLoteDto,
        fechaCaducidad,  // Asegúrate de que la fechaCaducidad esté correctamente manejada
        producto: product, // Asocia el producto
        user, // Asocia el lote al usuario
    });

    // Guarda el lote en la base de datos
    const savedLote = await this.loteRepository.save(lote);

    // Actualiza el stock total del producto
    const stockTotal = await this.productsService.calculateTotalStock(product.id, user);
    product.stockTotal = stockTotal;

    // Guarda el producto actualizado
    await this.productRepository.save(product);

    return savedLote;
}




  async findAll(paginationDto: PaginationDto, user: User): Promise<Lote[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    return await this.loteRepository.find({
      where: { user }, // Filtra lotes por el usuario
      take: limit,
      skip: offset,
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
    // Busca el lote a actualizar, incluyendo su relación con el producto
    const lote = await this.loteRepository.findOne({ where: { id, user }, relations: ['producto'] });

    if (!lote) {
        throw new NotFoundException('Lote no encontrado.');
    }

    // Si se proporciona `fechaCaducidad` (incluyendo `null`), actualízala
    if (updateLoteDto.fechaCaducidad === null) {
        lote.fechaCaducidad = null;
    } else if (updateLoteDto.fechaCaducidad) {
        lote.fechaCaducidad = updateLoteDto.fechaCaducidad;
    }

    // Actualiza los demás campos, solo si se han proporcionado
    lote.precioCompra = updateLoteDto.precioCompra ?? lote.precioCompra;
    lote.precioVenta = updateLoteDto.precioVenta ?? lote.precioVenta;
    lote.stock = updateLoteDto.stock ?? lote.stock;

    // Guarda el lote con los cambios
    const updatedLote = await this.loteRepository.save(lote);

    // Recalcula el stock total del producto asociado
    const product = lote.producto;
    product.stockTotal = await this.productsService.calculateTotalStock(product.id, user);

    // Guarda el producto actualizado
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

    // Busca lotes asociados al producto y al usuario
    const lotes = await this.loteRepository.find({
        where: {
            producto: product,
            user,
        },
    });

    console.log(`Lotes obtenidos en findAllByProductAndUser para producto ${productId}:`, lotes); // Log para verificar lotes

    return lotes;
}


async findAllByProduct(productId: string, user: User): Promise<Lote[]> {
  console.log(`Buscando lotes para productId: ${productId} y userId: ${user.id}`);
  
  try {
      const lotes = await this.loteRepository.find({
          where: { user, producto: { id: productId } }, // Cambia 'product' a 'producto'
      });

      console.log(`Lotes encontrados:`, lotes);
      return lotes;
  } catch (error) {
      console.error('Error al buscar lotes:', error);
      throw new Error('No se pudieron encontrar los lotes.');
  }
}


async obtenerEstadisticas(user: User) {
  try {
    // Obtención de estadísticas por día
    const gastosDia = await this.loteRepository
      .createQueryBuilder('lote')
      .select('SUM(lote.precioCompra)', 'totalCompra')
      .where('lote.userId = :userId', { userId: user.id })
      .andWhere("DATE(lote.fechaCreacion) = CURRENT_DATE")
      .getRawOne();

    // Obtención de estadísticas por mes
    const gastosMes = await this.loteRepository
      .createQueryBuilder('lote')
      .select('SUM(lote.precioCompra)', 'totalCompra')
      .where('lote.userId = :userId', { userId: user.id })
      .andWhere("EXTRACT(MONTH FROM lote.fechaCreacion) = EXTRACT(MONTH FROM CURRENT_DATE)")
      .andWhere("EXTRACT(YEAR FROM lote.fechaCreacion) = EXTRACT(YEAR FROM CURRENT_DATE)")
      .getRawOne();

    // Obtención de estadísticas por año
    const gastosAnio = await this.loteRepository
      .createQueryBuilder('lote')
      .select('SUM(lote.precioCompra)', 'totalCompra')
      .where('lote.userId = :userId', { userId: user.id })
      .andWhere("EXTRACT(YEAR FROM lote.fechaCreacion) = EXTRACT(YEAR FROM CURRENT_DATE)")
      .getRawOne();

    return {
      gastosDia: gastosDia?.totalCompra || 0,
      gastosMes: gastosMes?.totalCompra || 0,
      gastosAnio: gastosAnio?.totalCompra || 0,
    };
  } catch (error) {
    this.logger.error('Error al obtener estadísticas', error.stack);
    throw new Error('Error interno al calcular estadísticas.');
  }
}












}
