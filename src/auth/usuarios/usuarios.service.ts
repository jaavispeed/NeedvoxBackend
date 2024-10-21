import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsuariosService {
constructor(
@InjectRepository(User)
private readonly userRepository: Repository<User>,
) {}

// Método para obtener todos los usuarios registrados (sin relaciones)
async findAll(): Promise<User[]> {
return await this.userRepository.find({
    where: { isActive: true }, // Solo usuarios activos
    select: ['id', 'email', 'username', 'isActive', 'roles'], // Campos que necesitas
});
}
}