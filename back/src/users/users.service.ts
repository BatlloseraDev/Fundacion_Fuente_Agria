// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
  
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const { roleIds, ...userData } = createUserDto;

    const rolesData = roleIds && roleIds.length > 0
      ? {
          create: roleIds.map((id) => ({
            role: { connect: { id } },
          })),
        }
      : undefined;

    
    return this.prisma.user.create({
      data: {
        ...userData,
        roles: rolesData, // Aquí se crean las relaciones en UserRole automáticamente
      },
      include: {
        roles: {
          include: {
            role: true, // Para que devuelva los nombres de los roles creados
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: true, // Incluimos la info del rol (nombre, etc)
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { roleIds, password, ...userData } = updateUserDto;

    //TODO: hacer control de update

    return this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
      },
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

}
