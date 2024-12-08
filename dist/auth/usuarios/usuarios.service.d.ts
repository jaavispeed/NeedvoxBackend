import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class UsuariosService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findAll(): Promise<User[]>;
    updateEstado(id: string, isActive: boolean): Promise<User>;
}
