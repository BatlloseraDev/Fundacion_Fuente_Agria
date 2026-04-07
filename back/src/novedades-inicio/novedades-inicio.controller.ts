import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { NovedadesInicioService } from './novedades-inicio.service';

@Controller('novedades-inicio')
export class NovedadesInicioController {
  constructor(private readonly novedadesInicioService: NovedadesInicioService) {}

  @Get()
  async findAll() {
    return this.novedadesInicioService.findAll();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.novedadesInicioService.update(id, updateData);
  }
}