import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ActividadesService } from './actividades.service';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { JwtAuthGuard } from '../auth/jwt_strategy/jwt-auth.guard';

@Controller('actividades')
export class ActividadesController {
  constructor(private readonly service: ActividadesService) {}

  // ── Categorías (rutas estáticas antes de /:id) ──────────────────────────────

  @Get('categorias')
  findAllCategorias() {
    return this.service.findAllCategorias();
  }

  @UseGuards(JwtAuthGuard)
  @Post('categorias')
  createCategoria(@Body() dto: CreateCategoriaDto) {
    return this.service.createCategoria(dto.name, dto.color ?? 'primary');
  }

  @UseGuards(JwtAuthGuard)
  @Delete('categorias/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeCategoria(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeCategoria(id);
  }

  // ── Actividades ─────────────────────────────────────────────────────────────

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateActividadDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateActividadDto,
  ) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
