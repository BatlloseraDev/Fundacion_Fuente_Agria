import { PartialType } from '@nestjs/mapped-types';
import { CreateComentariosInicioDto } from './create-comentarios-inicio.dto';

export class UpdateComentariosInicioDto extends PartialType(CreateComentariosInicioDto) {}