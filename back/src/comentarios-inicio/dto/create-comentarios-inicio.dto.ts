import { IsString, IsNotEmpty } from 'class-validator';

export class CreateComentariosInicioDto {
  @IsString()
  @IsNotEmpty()
  texto: string;

  @IsString()
  @IsNotEmpty()
  etiqueta: string;

  @IsString()
  @IsNotEmpty()
  autor: string;
}