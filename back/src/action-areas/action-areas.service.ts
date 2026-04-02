import { Injectable } from '@nestjs/common';
import { CreateActionAreaDto } from './dto/create-action-area.dto';
import { UpdateActionAreaDto } from './dto/update-action-area.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActionAreasService {
  constructor(private prisma: PrismaService) {}

  create(createActionAreaDto: CreateActionAreaDto) {
    return this.prisma.actionArea.create({
      data: createActionAreaDto,
    });
  }

  findAll() {
    return this.prisma.actionArea.findMany();
  }

  findOne(id: number) {
    return this.prisma.actionArea.findUnique({
      where: { id },
    });
  }

  update(id: number, updateActionAreaDto: UpdateActionAreaDto) {
    return this.prisma.actionArea.update({
      where: { id },
      data: updateActionAreaDto,
    });
  }

  remove(id: number) {
    return this.prisma.actionArea.delete({
      where: { id },
    });
  }
}