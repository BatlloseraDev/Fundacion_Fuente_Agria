import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CatalogoArticleResponseDto } from './dto/catalogo-article-response.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('catalogo')
  async getCatalogo(): Promise<CatalogoArticleResponseDto[]> {
    return this.articlesService.getCatalogo();
  }

  @Get('catalogo/:id')
  async getCatalogoById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CatalogoArticleResponseDto> {
    return this.articlesService.getCatalogoById(id);
  }
}