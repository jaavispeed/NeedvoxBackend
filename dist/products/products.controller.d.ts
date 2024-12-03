import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { User } from '../auth/entities/user.entity';
import { Lote } from 'src/lotes/entities/lotes.entity';
import { LotesService } from 'src/lotes/lotes.service';
export declare class ProductsController {
    private readonly productsService;
    private readonly lotesService;
    constructor(productsService: ProductsService, lotesService: LotesService);
    create(createProductDto: CreateProductDto, user: User): Promise<import("./entities/product.entity").Product>;
    findAll(paginationDto: PaginationDto, user: User): Promise<{
        data: import("./entities/product.entity").Product[];
        hasMore: boolean;
    }>;
    findAllAdmin(paginationDto: PaginationDto): Promise<import("./entities/product.entity").Product[]>;
    findOne(term: string, user: User): Promise<import("./entities/product.entity").Product>;
    update(id: string, updateProductDto: UpdateProductDto, user: User): Promise<import("./entities/product.entity").Product>;
    remove(id: string, user: User): Promise<{
        message: string;
        id: string;
    }>;
    findByName(name: string, user: User): Promise<import("./entities/product.entity").Product>;
    countProductsByUser(userId: string): Promise<number>;
    findAllByProduct(productId: string, user: User): Promise<{
        lotes: Lote[];
        stockTotal: number;
    }>;
}
