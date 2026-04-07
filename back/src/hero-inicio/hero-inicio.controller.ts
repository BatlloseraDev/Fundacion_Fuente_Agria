import { Controller, Get, Body, Patch } from '@nestjs/common';
import { HeroInicioService } from './hero-inicio.service';

@Controller('hero-inicio')
export class HeroInicioController {
  constructor(private readonly heroInicioService: HeroInicioService) {}

  @Get()
  async findOne() {
    return this.heroInicioService.findOne();
  }

  @Patch()
  async update(@Body() updateData: any) {
    return this.heroInicioService.update(updateData);
  }
}