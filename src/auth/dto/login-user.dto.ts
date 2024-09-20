import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";


export class LoginUserDto{
    
    @IsEmail()
    email: string;
    
    @IsString()
    @MaxLength(50)
    @MinLength(6)
    password: string;

}