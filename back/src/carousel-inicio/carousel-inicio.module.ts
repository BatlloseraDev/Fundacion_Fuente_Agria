import { Module } from '@nestjs/common';
import { CarouselInicioService } from './carousel-inicio.service';
import { CarouselInicioController } from './carousel-inicio.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CarouselInicioController],
  providers: [CarouselInicioService],
  exports: [CarouselInicioService],
})
export class CarouselInicioModule {}