import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActionAreasService } from './action-areas.service';
import { CreateActionAreaDto } from './dto/create-action-area.dto';
import { UpdateActionAreaDto } from './dto/update-action-area.dto';

@Controller('action-areas')
export class ActionAreasController {
  constructor(private readonly actionAreasService: ActionAreasService) {}

  @Post()
  create(@Body() createActionAreaDto: CreateActionAreaDto) {
    return this.actionAreasService.create(createActionAreaDto);
  }

  @Get()
  findAll() {
    return this.actionAreasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actionAreasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActionAreaDto: UpdateActionAreaDto) {
    return this.actionAreasService.update(+id, updateActionAreaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actionAreasService.remove(+id);
  }
}