import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { User } from '../entities/user.entity';

@Module({
imports: [TypeOrmModule.forFeature([User])],
controllers: [UsuariosController],
providers: [UsuariosService],
})
export class UsuariosModule {}