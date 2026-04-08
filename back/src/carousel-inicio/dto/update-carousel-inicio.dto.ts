import { PartialType } from '@nestjs/mapped-types';
import { CreateCarouselInicioDto } from './create-carousel-inicio.dto';

export class UpdateCarouselInicioDto extends PartialType(CreateCarouselInicioDto) {}
