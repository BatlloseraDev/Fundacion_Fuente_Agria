import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateComentariosInicioDto } from './dto/update-comentarios-inicio.dto';

@Injectable()
export class ComentariosInicioService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const pageConfig = await this.prisma.page.findFirst({
      where: { stage: 'inicio_comentarios' },
    });

    if (!pageConfig || !pageConfig.contentJson) return [];

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

  async update(idElemento: string, updateData: UpdateComentariosInicioDto) {
    const pageConfig = await this.prisma.page.findFirst({
      where: { stage: 'inicio_comentarios' },
    });

    if (!pageConfig) throw new NotFoundException('No se encontró el stage inicio_comentarios');

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

    return { success: true, message: 'Comentario actualizado correctamente' };
  }
}