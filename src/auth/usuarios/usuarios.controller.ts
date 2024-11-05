import { Controller, Get, NotFoundException, Patch, Param, Body } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { User } from '../entities/user.entity';

@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) {}

    // Ruta GET para obtener todos los usuarios registrados
    @Get()
    async findAll(): Promise<User[]> {
        const users = await this.usuariosService.findAll();
        if (!users.length) {
            throw new NotFoundException('No hay usuarios registrados.');
        }
        return users; // Devuelve la lista de usuarios
    }

    // Ruta PATCH para activar/desactivar un usuario
    @Patch(':id/estado')
    async updateEstado(
        @Param('id') id: string,
        @Body('isActive') isActive: boolean
    ): Promise<User> {
        const updatedUser = await this.usuariosService.updateEstado(id, isActive);
        if (!updatedUser) {
            throw new NotFoundException('Usuario no encontrado.');
        }
        return updatedUser;
    }
}
