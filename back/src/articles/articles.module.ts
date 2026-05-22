import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketsModule } from '../websockets/websockets.module';

@Module({
  imports: [WebsocketsModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, PrismaService],
  exports: [ArticlesService],
})
export class ArticlesModule {}