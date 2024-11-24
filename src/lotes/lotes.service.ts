import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { Lote } from './entities/lotes.entity';
import { User } from 'src/auth/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
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
    const product = await this.productRepository.findOne({ where: { id: createLoteDto.productId } });

    if (!product) {
        throw new NotFoundException('Producto no encontrado.');
    }

    const lote = this.loteRepository.create({
        ...createLoteDto,
        producto: product,
        user, // Asocia el lote al usuario
    });

    const savedLote = await this.loteRepository.save(lote);

    // Actualiza el stock total del producto
    const stockTotal = await this.productsService.calculateTotalStock(product.id, user);
    product.stockTotal = stockTotal; // Actualiza el stockTotal en el objeto producto

    await this.productRepository.save(product); // Guarda el producto actualizado

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
    const lote = await this.loteRepository.findOne({ where: { id, user }, relations: ['producto'] });

    if (!lote) {
        throw new NotFoundException('Lote no encontrado.');
    }

    // Actualiza el lote con los nuevos datos
    const updatedLote = await this.loteRepository.save({
        ...lote,
        ...updateLoteDto,
    });

    // Asegúrate de que el producto esté correctamente asociado
    if (!lote.producto) {
        throw new NotFoundException('El lote no tiene un producto asociado.');
    }

    // Recalcula el stock total del producto
    const product = lote.producto; // Usa el producto que ya tienes
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


async obtenerEstadisticas(user: User, tipo: 'dia' | 'mes' | 'año') {
  try {
    let truncDate;
    let dateFilter;
    
    // Definimos cómo truncar la fecha según el tipo
    switch (tipo) {
      case 'mes':
        truncDate = 'month';  // Agrupamos por mes
        dateFilter = "EXTRACT(YEAR FROM lote.fechaCreacion) = EXTRACT(YEAR FROM CURRENT_DATE)"; // Solo lotes de este año
        break;
      case 'año':
        truncDate = 'year';   // Agrupamos por año
        dateFilter = "EXTRACT(YEAR FROM lote.fechaCreacion) = EXTRACT(YEAR FROM CURRENT_DATE)"; // Solo lotes de este año
        break;
      case 'dia':
      default:
        truncDate = 'day';  // Agrupamos por día
        dateFilter = "DATE(lote.fechaCreacion) = CURRENT_DATE"; // Solo lotes creados hoy
        break;
    }

    // Obtenemos las estadísticas con el precio de compra sumado
    const estadisticas = await this.loteRepository
      .createQueryBuilder('lote')
      .select([ 
        `DATE_TRUNC('${truncDate}', lote.fechaCreacion) AS fecha`,  // Agrupamos según el tipo (día, mes, año)
        'SUM(lote.precioCompra) AS totalCompra'  // Sumamos los precios de compra
      ])
      .where('lote.userId = :userId', { userId: user.id })
      .andWhere(dateFilter)  // Aplicamos el filtro adecuado según el tipo
      .groupBy('fecha')  // Agrupamos por fecha truncada
      .orderBy('fecha', 'DESC')  // Ordenamos por fecha en orden descendente
      .getRawMany();  // Obtenemos los resultados

    return { estadisticas };
  } catch (error) {
    this.logger.error('Error al obtener estadísticas', error.stack);
    throw new Error('Error interno al calcular estadísticas.');
  }
}










}
