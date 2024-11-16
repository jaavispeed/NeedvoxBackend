import { Controller, Get, Post, Body, UseGuards, Req, SetMetadata,Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CreateUserDto, LoginUserDto } from './dto';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';
import { Auth } from './decorators';
import { UpdateUserDto } from './dto/updateUserDto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
  

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ){
    return this.authService.checkAuthStatus(user);
  }

  @Get('perfil') // Endpoint para obtener perfil
  @Auth()  
  async getPerfil(@GetUser() user: User) {
    return await this.authService.getUserById(user.id); 
  }

  
  @Get('private')
  @Auth()
  PrivateRoute(
    @GetUser() user:User
  ){
    return{
      ok: true,
      message: 'Hola mundo private',
      user,
    }
  }

  @Get('private2')
  @Auth(ValidRoles.admin)
  PrivateRoute2(
    @GetUser() user:User
  ){
    return{
      ok: true,
      message: 'Hola mundo private',
      user,
    }
  }

  @Patch('update-profile')
  @Auth()
    async updateUserProfile(
  @GetUser() user: User,
  @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.updateUserProfile(user.id, updateUserDto);
  }
}
