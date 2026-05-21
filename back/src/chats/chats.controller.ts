import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/jwt_strategy/jwt-auth.guard';
import { Req } from '@nestjs/common';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  findAll() {
    return this.chatsService.findAll();
  }

  @Get(':id/messages')
  findMessages(@Param('id', ParseIntPipe) id: number) {
    return this.chatsService.findMessages(id);
  }

  @Get('my-chat')
  findMyChat(@Req() req: any) {
    return this.chatsService.findMyChat(req.user.id);
  }
}
