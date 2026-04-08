import { Module } from '@nestjs/common';
import { ActionAreasService } from './action-areas.service';
import { ActionAreasController } from './action-areas.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActionAreasController],
  providers: [ActionAreasService],
  exports: [ActionAreasService],
})
export class ActionAreasModule {}