import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { WebsocketsModule } from '../websockets/websockets.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [PrismaModule, MailModule, WebsocketsModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
