import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActionAreasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const pageConfig = await this.prisma.page.findFirst({
      where: { stage: 'action_areas' },
    });

    if (!pageConfig || !pageConfig.contentJson) {
      return [];
    }

    let parsedJson: any[];
    try {
      parsedJson = typeof pageConfig.contentJson === 'string'
        ? JSON.parse(pageConfig.contentJson)
        : pageConfig.contentJson;
    } catch (e) {
      console.log("Error parseando JSON, " + e);
      return [];
    }

    return parsedJson;
  }

  async update(idElemento: string, updateData: any) {
    const pageConfig = await this.prisma.page.findFirst({
      where: { stage: 'action_areas' },
    });

    if (!pageConfig) {
      throw new NotFoundException('No se encontró el stage action_areas en la tabla Page');
    }

    let parsedJson: any[];
    try {
      parsedJson = typeof pageConfig.contentJson === 'string'
        ? JSON.parse(pageConfig.contentJson)
        : pageConfig.contentJson;
    } catch (e) {
      throw new Error("Error parseando JSON en la actualización");
    }

    const updatedJson = parsedJson.map((item) =>
      item.id === idElemento ? { ...item, ...updateData } : item
    );

    await this.prisma.page.update({
      where: { id: pageConfig.id },
      data: { contentJson: updatedJson },
    });

    return { success: true, message: 'Área de acción actualizada correctamente' };
  }
}