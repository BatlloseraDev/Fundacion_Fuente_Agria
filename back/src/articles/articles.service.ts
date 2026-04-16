import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) { }

  private userHasEditorRole(user: any) {
    const roles = user?.roles ?? [];

    const roleNames = roles
      .map((item: any) => {
        if (typeof item === 'string') return item;
        if (item?.name) return item.name;
        if (item?.role?.name) return item.role.name;
        return null;
      })
      .filter(Boolean);

    return roleNames.includes('ADMIN') || roleNames.includes('EDITOR');
  }

  async findCatalogo() {
    return this.prisma.article.findMany({
      include: {
        categories: {
          include: {
            categoryArticle: true,
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(dto: CreateArticleDto, user: any) {
  console.log('CREATE DTO:', dto);
  console.log('USER EN ARTICLES:', JSON.stringify(user, null, 2));

  if (!this.userHasEditorRole(user)) {
    throw new ForbiddenException('No tienes permisos para crear articulos');
  }

  const article = await this.prisma.article.create({
    data: {
      name: dto.name,
      description: dto.description,
      longDescription: dto.longDescription,
      price: dto.price,
      available: dto.available,
      image: dto.image,
      userId: user.id,
    },
  });

  console.log('ARTICULO CREADO:', article);

  if (dto.categoria) {
    console.log('ANTES CATEGORIA');
    const category = await this.prisma.categoryArticle.upsert({
      where: { name: dto.categoria },
      update: {
        color: dto.colorCategoria ?? 'primary',
      },
      create: {
        name: dto.categoria,
        color: dto.colorCategoria ?? 'primary',
      },
    });

    console.log('CATEGORIA OK:', category);

    await this.prisma.articleCat.createMany({
      data: [
        {
          articleId: article.id,
          categoryArticleId: category.id,
        },
      ],
      skipDuplicates: true,
    });

    console.log('RELACION CATEGORIA OK');
  }

  if (dto.etiquetas?.length) {
    const etiquetasUnicas = [...new Set(dto.etiquetas.filter(Boolean))];

    for (const etiqueta of etiquetasUnicas) {
      console.log('ANTES ETIQUETA:', etiqueta);

      const label = await this.prisma.label.upsert({
        where: { name: etiqueta },
        update: {},
        create: {
          name: etiqueta,
          color: 'primary',
        },
      });

      console.log('LABEL OK:', label);

      await this.prisma.articleLabel.createMany({
        data: [
          {
            articleId: article.id,
            labelId: label.id,
          },
        ],
        skipDuplicates: true,
      });

      console.log('RELACION ETIQUETA OK:', etiqueta);
    }
  }

  console.log('ANTES RETURN FINAL');

  return this.prisma.article.findUnique({
    where: { id: article.id },
    include: {
      categories: {
        include: {
          categoryArticle: true,
        },
      },
      labels: {
        include: {
          label: true,
        },
      },
    },
  });
}

  async update(id: number, dto: UpdateArticleDto, user: any) {
    if (!this.userHasEditorRole(user)) {
      throw new ForbiddenException('No tienes permisos para editar articulos');
    }

    const existing = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Articulo no encontrado');
    }

    await this.prisma.article.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        description: dto.description ?? existing.description,
        longDescription:
          dto.longDescription !== undefined
            ? dto.longDescription
            : existing.longDescription,
        price: dto.price ?? existing.price,
        available: dto.available ?? existing.available,
        image: dto.image !== undefined ? dto.image : existing.image,
      },
    });

    if (dto.categoria !== undefined) {
      await this.prisma.articleCat.deleteMany({
        where: { articleId: id },
      });

      if (dto.categoria) {
        const category = await this.prisma.categoryArticle.upsert({
          where: { name: dto.categoria },
          update: {
            color: dto.colorCategoria ?? 'primary',
          },
          create: {
            name: dto.categoria,
            color: dto.colorCategoria ?? 'primary',
          },
        });

        await this.prisma.articleCat.createMany({
          data: [
            {
              articleId: id,
              categoryArticleId: category.id,
            },
          ],
          skipDuplicates: true,
        });
      }
    }

    if (dto.etiquetas !== undefined) {
      await this.prisma.articleLabel.deleteMany({
        where: { articleId: id },
      });

      const etiquetasUnicas = [...new Set(dto.etiquetas.filter(Boolean))];

      for (const etiqueta of etiquetasUnicas) {
        const label = await this.prisma.label.upsert({
          where: { name: etiqueta },
          update: {},
          create: {
            name: etiqueta,
            color: 'primary',
          },
        });

        await this.prisma.articleLabel.createMany({
          data: [
            {
              articleId: id,
              labelId: label.id,
            },
          ],
          skipDuplicates: true,
        });
      }
    }

    return this.prisma.article.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            categoryArticle: true,
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
      },
    });
  }

  async remove(id: number, user: any) {
    if (!this.userHasEditorRole(user)) {
      throw new ForbiddenException('No tienes permisos para eliminar articulos');
    }

    const existing = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Articulo no encontrado');
    }

    await this.prisma.article.delete({
      where: { id },
    });

    return { message: 'Articulo eliminado correctamente' };
  }
}