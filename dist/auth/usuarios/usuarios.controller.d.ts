import { UsuariosService } from './usuarios.service';
import { User } from '../entities/user.entity';
export declare class UsuariosController {
    private readonly usuariosService;
    constructor(usuariosService: UsuariosService);
    findAll(): Promise<User[]>;
    updateEstado(id: string, isActive: boolean): Promise<User>;
}
