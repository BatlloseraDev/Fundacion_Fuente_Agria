import { PartialType } from '@nestjs/mapped-types';
import { CreateHeroInicioDto } from './create-hero-inicio.dto';

export class UpdateHeroInicioDto extends PartialType(CreateHeroInicioDto) {}
