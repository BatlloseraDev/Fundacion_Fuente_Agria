import { Module } from '@nestjs/common';
import { ComentariosInicioService } from './comentarios-inicio.service';
import { ComentariosInicioController } from './comentarios-inicio.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ComentariosInicioController],
  providers: [ComentariosInicioService],
  exports: [ComentariosInicioService],
})
export class ComentariosInicioModule {}