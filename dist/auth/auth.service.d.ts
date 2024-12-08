import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { UpdateUserDto } from './dto/updateUserDto';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    create(createUserDto: CreateUserDto): Promise<{
        token: string;
        id: string;
        email: string;
        username: string;
        password: string;
        isActive: boolean;
        roles: string[];
        products: import("../products/entities/product.entity").Product[];
        ventas: import("../ventas/entities/ventas.entity").Venta[];
        lotes: import("../lotes/entities/lotes.entity").Lote[];
    }>;
    login(loginUserDto: LoginUserDto): Promise<{
        token: string;
        id: string;
        email: string;
        username: string;
        password: string;
        isActive: boolean;
        roles: string[];
        products: import("../products/entities/product.entity").Product[];
        ventas: import("../ventas/entities/ventas.entity").Venta[];
        lotes: import("../lotes/entities/lotes.entity").Lote[];
    }>;
    checkAuthStatus(user: User): Promise<{
        token: string;
        id: string;
        email: string;
        username: string;
        password: string;
        isActive: boolean;
        roles: string[];
        products: import("../products/entities/product.entity").Product[];
        ventas: import("../ventas/entities/ventas.entity").Venta[];
        lotes: import("../lotes/entities/lotes.entity").Lote[];
    }>;
    getUserById(userId: string): Promise<User>;
    private getJwtToken;
    private handleDBErrors;
    changePassword(user: User, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    updateUserProfile(userId: string, updateUserDto: UpdateUserDto): Promise<User>;
}
