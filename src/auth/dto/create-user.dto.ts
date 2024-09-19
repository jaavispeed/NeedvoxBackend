import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";


export class CreateUserDto{
    
    @IsString()
    @IsEmail()
    email: string;
    
    @IsString()
    @MaxLength(50)
    @MinLength(6)
    password: string;

    @IsString()
    @MinLength(1)
    username: string;
}