import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../auth/jwt_strategy/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

const uploadDir = './uploads/articles';

function ensureUploadDir() {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('catalogo')
  findCatalogo() {
    return this.articlesService.findCatalogo();
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureUploadDir();
          cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
          const safeExt = extname(file.originalname).toLowerCase() || '.jpg';
          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
          cb(null, filename);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new Error('Solo se permiten imagenes'), false);
          return;
        }
        cb(null, true);
      },
      limits: { fileSize: 4 * 1024 * 1024 },
    }),
  )
  uploadImage(@UploadedFile() file: any) {
    return {
      imageUrl: `/uploads/articles/${file.filename}`,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateArticleDto, @Req() req: any) {
    return this.articlesService.create(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleDto,
    @Req() req: any,
  ) {
    return this.articlesService.update(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.articlesService.remove(id, req.user);
  }
}
