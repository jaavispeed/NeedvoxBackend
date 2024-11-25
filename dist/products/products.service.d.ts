import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { User } from 'src/auth/entities/user.entity';
import { LotesService } from 'src/lotes/lotes.service';
export declare class ProductsService {
    private readonly productRepository;
    private readonly lotesService;
    private readonly logger;
    constructor(productRepository: Repository<Product>, lotesService: LotesService);
    create(createProductDto: CreateProductDto, user: User): Promise<Product>;
    findAll(paginationDto: PaginationDto, user: User): Promise<{
        data: Product[];
        hasMore: boolean;
    }>;
    findOne(term: string, user: User): Promise<Product>;
    update(id: string, updateProductDto: UpdateProductDto, user: User): Promise<Product>;
    calculateTotalStock(productId: string, user: User): Promise<number>;
    remove(id: string, user: User): Promise<Product | null>;
    private handleDBExceptions;
    findByBarcodeAndUser(barcode: string, user: User): Promise<Product | undefined>;
    findByName(title: string, user: User): Promise<Product>;
    countByUser(userId: string): Promise<number>;
    findAllAdmin(paginationDto: PaginationDto): Promise<Product[]>;
}
