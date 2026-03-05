import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { RoleName } from '../common/types/role-name.enum';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const userRole = await this.prisma.role.findUnique({
      where: { name: RoleName.USER },
      select: { id: true },
    });

    if (!userRole) {
      throw new InternalServerErrorException('Rol USER no existe en la base de datos');
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        subname: dto.subname,
        roles: {
          create: [
            {
              role: { connect: { id: userRole.id } },
            },
          ],
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        subname: true,
        address: true,
        dni: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          include: { role: true },
        },
      },
    });

    return {
      message: 'Usuario registrado correctamente',
      user,
    };
  }

  async login(dto: any) {
    return { message: 'Login correcto' };
  }
}