import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogoArticleResponseDto } from './dto/catalogo-article-response.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCatalogo(): Promise<CatalogoArticleResponseDto[]> {
    const articles = await this.prisma.article.findMany({
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

    return articles.map((article) => ({
      id: article.id,
      name: article.name,
      description: article.description,
      longDescription: article.longDescription,
      price: article.price,
      available: article.available,
      image: article.image,
      categories: article.categories.map((item) => ({
        id: item.categoryArticle.id,
        name: item.categoryArticle.name,
        color: item.categoryArticle.color,
      })),
      labels: article.labels.map((item) => ({
        id: item.label.id,
        name: item.label.name,
        color: item.label.color,
      })),
    }));
  }

  async getCatalogoById(id: number): Promise<CatalogoArticleResponseDto> {
    const article = await this.prisma.article.findUnique({
      where: {
        id,
      },
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

    if (!article) {
      throw new NotFoundException(`No existe ningun articulo con id ${id}`);
    }

    return {
      id: article.id,
      name: article.name,
      description: article.description,
      longDescription: article.longDescription,
      price: article.price,
      available: article.available,
      image: article.image,
      categories: article.categories.map((item) => ({
        id: item.categoryArticle.id,
        name: item.categoryArticle.name,
        color: item.categoryArticle.color,
      })),
      labels: article.labels.map((item) => ({
        id: item.label.id,
        name: item.label.name,
        color: item.label.color,
      })),
    };
  }
}