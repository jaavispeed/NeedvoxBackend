import { LotesService } from './lotes.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { Lote } from './entities/lotes.entity';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ProductsService } from 'src/products/products.service';
export declare class LotesController {
    private readonly lotesService;
    private readonly productsService;
    constructor(lotesService: LotesService, productsService: ProductsService);
    obtenerEstadisticas(user: User, tipo: 'dia' | 'mes' | 'año'): Promise<any>;
    create(createLoteDto: CreateLoteDto, user: User): Promise<Lote>;
    findAll(paginationDto: PaginationDto, user: User): Promise<Lote[]>;
    findOne(id: string, user: User): Promise<Lote>;
    update(id: string, updateLoteDto: UpdateLoteDto, user: User): Promise<Lote>;
    remove(id: string, user: User): Promise<void>;
    findAllByUser(user: User): Promise<Lote[]>;
    findAllByProduct(productId: string, user: User): Promise<{
        lotes: Lote[];
        stockTotal: number;
    }>;
}
