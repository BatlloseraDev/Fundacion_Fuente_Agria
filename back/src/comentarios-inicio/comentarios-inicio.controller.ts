import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { ComentariosInicioService } from './comentarios-inicio.service';
import { UpdateComentariosInicioDto } from './dto/update-comentarios-inicio.dto';

@Controller('comentarios-inicio')
export class ComentariosInicioController {
  constructor(private readonly comentariosInicioService: ComentariosInicioService) {}

  @Get()
  async findAll() {
    return this.comentariosInicioService.findAll();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateComentariosInicioDto: UpdateComentariosInicioDto) {
    return this.comentariosInicioService.update(id, updateComentariosInicioDto);
  }
}