import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { LangchainService } from './langchain.service';

@Module({
  providers: [ChatGateway, LangchainService],
})
export class ChatModule {}