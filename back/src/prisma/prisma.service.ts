// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client'
import { createPool } from 'mysql2/promise';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // En Prisma 7, el adaptador recibe directamente los datos de conexión
    const adapter = new PrismaMariaDb({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USERNAME || process.env.MYSQL_USER,
      password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
      database: process.env.DB_DATABASE || process.env.MYSQL_DATABASE
    });
    
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}