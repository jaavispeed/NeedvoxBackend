import { CreateUserDto, LoginUserDto } from './dto';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/updateUserDto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    createUser(createUserDto: CreateUserDto): Promise<{
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
    loginUser(loginUserDto: LoginUserDto): Promise<{
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
    getPerfil(user: User): Promise<User>;
    PrivateRoute(user: User): {
        ok: boolean;
        message: string;
        user: User;
    };
    PrivateRoute2(user: User): {
        ok: boolean;
        message: string;
        user: User;
    };
    updateUserProfile(user: User, updateUserDto: UpdateUserDto): Promise<User>;
}
