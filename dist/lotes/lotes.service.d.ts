import { Repository } from 'typeorm';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { Lote } from './entities/lotes.entity';
import { User } from 'src/auth/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ProductsService } from 'src/products/products.service';
export declare class LotesService {
    private readonly loteRepository;
    private readonly productRepository;
    private readonly productsService;
    private readonly logger;
    constructor(loteRepository: Repository<Lote>, productRepository: Repository<Product>, productsService: ProductsService);
    create(createLoteDto: CreateLoteDto, user: User): Promise<Lote>;
    findAll(paginationDto: PaginationDto, user: User): Promise<Lote[]>;
    findOne(id: string, user: User): Promise<Lote>;
    update(id: string, updateLoteDto: UpdateLoteDto, user: User): Promise<Lote>;
    remove(id: string, user: User): Promise<void>;
    findAllByUser(user: User): Promise<Lote[]>;
    findAllByProductAndUser(productId: string, user: User): Promise<Lote[]>;
    findAllByProduct(productId: string, user: User): Promise<Lote[]>;
    obtenerEstadisticas(user: User, tipo: 'dia' | 'mes' | 'año'): Promise<{
        estadisticas: any[];
    }>;
}
