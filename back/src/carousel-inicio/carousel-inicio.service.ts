import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CarouselInicioService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const pageConfig = await this.prisma.page.findFirst({
      where: { stage: 'inicio_carousel' },
    });

    if (!pageConfig || !pageConfig.contentJson) {
      return [];
    }

    try {
      return typeof pageConfig.contentJson === 'string'
        ? JSON.parse(pageConfig.contentJson)
        : pageConfig.contentJson;
    } catch (e) {
      console.error("Error parseando JSON del carrusel:", e);
      return [];
    }
  }

  async update(idElemento: string, updateData: any) {
    const pageConfig = await this.prisma.page.findFirst({
      where: { stage: 'inicio_carousel' },
    });

    if (!pageConfig) {
      throw new NotFoundException('No se encontró la configuración inicio_carousel en la tabla Page');
    }

    let parsedJson: any[];
    try {
      parsedJson = typeof pageConfig.contentJson === 'string'
        ? JSON.parse(pageConfig.contentJson)
        : pageConfig.contentJson;
    } catch (e) {
      throw new Error("Error parseando JSON en la actualización del carrusel");
    }

    const updatedJson = parsedJson.map((item) =>
      item.id === idElemento ? { ...item, ...updateData } : item
    );

    await this.prisma.page.update({
      where: { id: pageConfig.id },
      data: { contentJson: updatedJson },
    });

    return { success: true, message: 'Diapositiva actualizada correctamente' };
  }
}