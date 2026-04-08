import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { CarouselInicioService } from './carousel-inicio.service';

@Controller('carousel-inicio')
export class CarouselInicioController {
  constructor(private readonly carouselInicioService: CarouselInicioService) {}

  @Get()
  async findAll() {
    return this.carouselInicioService.findAll();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.carouselInicioService.update(id, updateData);
  }
}