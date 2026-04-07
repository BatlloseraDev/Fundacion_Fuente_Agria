import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { ActionAreasService } from './action-areas.service';

@Controller('action-areas')
export class ActionAreasController {
  constructor(private readonly actionAreasService: ActionAreasService) {}

  @Get()
  async findAll() {
    return this.actionAreasService.findAll();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.actionAreasService.update(id, updateData);
  }
}