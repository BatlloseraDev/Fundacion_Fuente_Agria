import { Module } from '@nestjs/common';
import { HeroInicioService } from './hero-inicio.service';
import { HeroInicioController } from './hero-inicio.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HeroInicioController],
  providers: [HeroInicioService],
  exports: [HeroInicioService],
})
export class HeroInicioModule {}