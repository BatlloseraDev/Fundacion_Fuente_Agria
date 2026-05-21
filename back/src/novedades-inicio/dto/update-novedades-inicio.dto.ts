import { PartialType } from '@nestjs/mapped-types';
import { CreateNovedadesInicioDto } from './create-novedades-inicio.dto';

export class UpdateNovedadesInicioDto extends PartialType(CreateNovedadesInicioDto) {}
