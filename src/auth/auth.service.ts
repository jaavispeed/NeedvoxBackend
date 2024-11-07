import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt.payload.interface';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true, isActive: true } // Incluir isActive
    });

    if (!user) {
      throw new UnauthorizedException('Credentials are not valid (email)');
    }
    if (!user.isActive) { // Verifica si el usuario está activo
      throw new UnauthorizedException('User account is inactive'); // Lanza excepción si está inactivo
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credentials are not valid (password)');
    }

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: { email: true, username: true, id: true } // Asegúrate de seleccionar los campos que necesitas
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }

  async changePassword(user: User, currentPassword: string, newPassword: string) {
    const userFromDB = await this.userRepository.findOne({ where: { id: user.id } });
    
    if (!userFromDB || !bcrypt.compareSync(currentPassword, userFromDB.password)) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }
  
    userFromDB.password = bcrypt.hashSync(newPassword, 10);
    await this.userRepository.save(userFromDB);
    
    return { message: 'Contraseña actualizada con éxito' };
  }
  
}