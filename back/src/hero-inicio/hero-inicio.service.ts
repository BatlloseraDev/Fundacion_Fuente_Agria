import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HeroInicioService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne() {
    const pageConfig = await this.prisma.page.findFirst({
      where: { stage: 'inicio_hero' },
    });

    if (!pageConfig || !pageConfig.contentJson) {
      return {};
    }

    try {
      return typeof pageConfig.contentJson === 'string'
        ? JSON.parse(pageConfig.contentJson)
        : pageConfig.contentJson;
    } catch (e) {
      return {};
    }
  }

  async update(updateData: any) {
    const pageConfig = await this.prisma.page.findFirst({
      where: { stage: 'inicio_hero' },
    });

    if (!pageConfig) {
      throw new NotFoundException('No se encontró el stage inicio_hero');
    }

    let parsedJson: any = {};
    try {
      parsedJson = typeof pageConfig.contentJson === 'string'
        ? JSON.parse(pageConfig.contentJson)
        : pageConfig.contentJson;
    } catch (e) {
      throw new Error("Error parseando JSON en la actualización");
    }

    const updatedJson = { ...parsedJson, ...updateData };

    await this.prisma.page.update({
      where: { id: pageConfig.id },
      data: { contentJson: updatedJson },
    });

    return { success: true, message: 'Hero actualizado correctamente' };
  }
}