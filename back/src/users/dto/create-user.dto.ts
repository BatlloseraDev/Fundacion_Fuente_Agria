import { IsString, IsEmail, IsNotEmpty, IsArray, IsOptional, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  subname: string;

  // Recibimos un array de IDs de roles, ej: [1, 2]
  @IsArray()
  @IsInt({ each: true }) // Valida que cada elemento sea un número
  @IsOptional()
  roleIds?: number[];
}