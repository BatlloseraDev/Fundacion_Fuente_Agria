import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private readonly orderWithUser = {
    id: true,
    title: true,
    text: true,
    quantity: true,
    imageBefore: true,
    imageAfter: true,
    active: true,
    price: true,
    timeInitial: true,
    timeFinal: true,
    user: {
      select: {
        id: true,
        name: true,
        subname: true,
        email: true,
      },
    },
  } as const;

  findAll() {
    return this.prisma.order.findMany({
      select: this.orderWithUser,
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: this.orderWithUser,
    });
    if (!order) throw new NotFoundException('Encargo no encontrado');
    return order;
  }

  async update(id: number, dto: UpdateOrderDto) {
    const exists = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Encargo no encontrado');

    return this.prisma.order.update({
      where: { id },
      data: {
        ...dto,
        timeInitial: dto.timeInitial ? new Date(dto.timeInitial) : undefined,
        timeFinal: dto.timeFinal ? new Date(dto.timeFinal) : undefined,
      },
      select: this.orderWithUser,
    });
  }
}
