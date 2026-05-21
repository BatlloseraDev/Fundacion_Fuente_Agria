import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';

@Injectable()
export class ActividadesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Actividades ─────────────────────────────────────────────────────────────

  async findAll() {
    const rows = await this.prisma.actividad.findMany({
      include: { category: true },
      orderBy: { date: 'desc' },
    });
    return rows.map(this.mapRow);
  }

  async findOne(id: number) {
    const row = await this.prisma.actividad.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!row) throw new NotFoundException(`Actividad con id ${id} no encontrada`);
    return this.mapRow(row);
  }

  async create(dto: CreateActividadDto) {
    const row = await this.prisma.actividad.create({
      data: {
        title: dto.title,
        description: dto.description,
        date: new Date(dto.date),
        coverImage: dto.coverImage,
        categoryId: dto.categoryId,
        contentJson: (dto.blocks ?? []) as unknown as any,
      },
      include: { category: true },
    });
    return this.mapRow(row);
  }

  async update(id: number, dto: UpdateActividadDto) {
    await this.findOne(id);
    const data: Record<string, any> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.coverImage !== undefined) data.coverImage = dto.coverImage;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.blocks !== undefined) data.contentJson = dto.blocks;

    const row = await this.prisma.actividad.update({
      where: { id },
      data,
      include: { category: true },
    });
    return this.mapRow(row);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.actividad.delete({ where: { id } });
  }

  // ── Categorías ───────────────────────────────────────────────────────────────

  async findAllCategorias() {
    return this.prisma.categoriaActividad.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async createCategoria(name: string, color: string) {
    return this.prisma.categoriaActividad.upsert({
      where: { name },
      update: { deletedAt: null, color },
      create: { name, color },
    });
  }

  async removeCategoria(id: number) {
    const cat = await this.prisma.categoriaActividad.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException(`Categoría con id ${id} no encontrada`);
    return this.prisma.categoriaActividad.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ── Mapper ───────────────────────────────────────────────────────────────────

  private mapRow(row: any) {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.date,
      coverImage: row.coverImage ?? null,
      categoryId: row.categoryId ?? null,
      category: row.category
        ? { id: row.category.id, name: row.category.name, color: row.category.color }
        : null,
      blocks: row.contentJson ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
