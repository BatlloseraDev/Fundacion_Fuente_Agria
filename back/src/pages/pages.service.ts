import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig(stage: string, defaultValue: object = {}) {
    const page = await this.prisma.page.findFirst({ where: { stage } });
    if (!page) return defaultValue;
    return typeof page.contentJson === 'string'
      ? JSON.parse(page.contentJson)
      : page.contentJson;
  }

  async saveConfig(stage: string, data: object) {
    const existing = await this.prisma.page.findFirst({ where: { stage } });
    if (existing) {
      return this.prisma.page.update({
        where: { id: existing.id },
        data: { contentJson: data as any },
      });
    }
    return this.prisma.page.create({ data: { stage, contentJson: data as any } });
  }
}
