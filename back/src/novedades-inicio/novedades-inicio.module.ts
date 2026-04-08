import { Module } from '@nestjs/common';
import { NovedadesInicioService } from './novedades-inicio.service';
import { NovedadesInicioController } from './novedades-inicio.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NovedadesInicioController],
  providers: [NovedadesInicioService],
  exports: [NovedadesInicioService],
})
export class NovedadesInicioModule {}