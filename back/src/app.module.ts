import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';
import { OrdersModule } from './orders/orders.module';
import { ActionAreasModule } from './action-areas/action-areas.module';
import { ComentariosInicioModule } from './comentarios-inicio/comentarios-inicio.module';
import { NovedadesInicioModule } from './novedades-inicio/novedades-inicio.module';
import { HeroInicioModule } from './hero-inicio/hero-inicio.module';
import { CarouselInicioModule } from './carousel-inicio/carousel-inicio.module';
import { ChatsModule } from './chats/chats.module';
import { ActividadesModule } from './actividades/actividades.module';
import { ChatModule } from './chat/chat.module';
import { WebsocketsModule } from './websockets/websockets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    UsersModule,
    RolesModule,
    AuthModule,
    ArticlesModule,
    ActionAreasModule,
    ComentariosInicioModule,
    NovedadesInicioModule,
    HeroInicioModule,
    CarouselInicioModule,
    OrdersModule,
    ChatsModule,
    ActividadesModule,
    ChatModule
    WebsocketsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
