import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { LangchainService } from './langchain.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ChatGateway, LangchainService],
})
export class ChatModule {}
