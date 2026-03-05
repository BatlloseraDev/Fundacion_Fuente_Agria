import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

    const { roleIds, ...userData } = createUserDto;

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
        roles: rolesData,
      },
      select: this.userSelect,
    });
  }

  findAll() {
    return this.prisma.user.findMany({
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

  async remove(id: number) {
    const exists = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.prisma.user.delete({
      where: { id },
      select: { id: true },
    });
  }
}