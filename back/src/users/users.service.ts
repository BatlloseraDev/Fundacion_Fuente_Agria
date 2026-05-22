import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  private readonly userSelect = {
    id: true,
    email: true,
    name: true,
    subname: true,
    address: true,
    dni: true,
    createdAt: true,
    updatedAt: true,
    roles: {
      include: {
        role: true,
      },
    },
  } as const;

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const { roleIds, password, ...userData } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const rolesData =
      roleIds && roleIds.length > 0
        ? {
          create: roleIds.map((id) => ({
            role: { connect: { id } },
          })),
        }
        : undefined;

    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        roles: rolesData,
      },
      select: this.userSelect,
    });
  }

  private readonly activeFilter = { inactiveAt: null } as const;

  findAll() {
    return this.prisma.user.findMany({
      where: this.activeFilter,
      select: this.userSelect,
    });
  }

  findByRole(roleName: string) {
    return this.prisma.user.findMany({
      where: {
        ...this.activeFilter,
        roles: {
          some: {
            role: { name: roleName },
          },
        },
      },
      select: this.userSelect,
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { roleIds, password, ...userData } = updateUserDto as any;

    const hasUserFields = Object.values(userData).some(
      (v) => v !== undefined && v !== null
    );

    if (!hasUserFields && !Array.isArray(roleIds)) {
      throw new BadRequestException('No hay datos para actualizar');
    }

    const rolesUpdate = Array.isArray(roleIds)
      ? {
        roles: {
          deleteMany: {},
          create: roleIds.map((roleId: number) => ({
            role: { connect: { id: roleId } },
          })),
        },
      }
      : {};

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...userData,
          ...rolesUpdate,
        },
        select: this.userSelect,
      });
    } catch (error: any) {
      // Prisma unique constraint error (GPT)
      if (error.code === 'P2002') {
        throw new ConflictException('Email o DNI ya está en uso');
      }
      throw error;
    }
  }

  async updateProfile(id: number, dto: UpdateProfileDto) {
    const { password, ...fields } = dto;

    const data: any = { ...fields };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: this.userSelect,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('El email o DNI ya está en uso');
      }
      throw error;
    }
  }

  async getBilling(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, subname: true, email: true, dni: true, address: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const [orders, purchases] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId: id },
        select: {
          id: true, title: true, text: true, status: true,
          price: true, createdAt: true, timeInitial: true, timeFinal: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.purchase.findMany({
        where: { userId: id },
        include: {
          articles: {
            include: { article: { select: { id: true, name: true, image: true } } },
          },
        },
        orderBy: { date: 'desc' },
      }),
    ]);

    const purchasesWithTotal = purchases.map((p) => ({
      ...p,
      total: p.articles.reduce((sum, a) => sum + a.estimatedPrice * a.quantity, 0),
    }));

    return { user, orders, purchases: purchasesWithTotal };
  }

  async remove(id: number) {
    const exists = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, inactiveAt: true },
    });

    if (!exists) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.prisma.user.update({
      where: { id },
      data: { inactiveAt: new Date() },
      select: { id: true },
    });
  }
}