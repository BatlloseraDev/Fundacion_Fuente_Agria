import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { RoleName } from '../common/types/role-name.enum';
import { JwtService } from '@nestjs/jwt';
import { GoogleAuthService } from './google/google-auth.service';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService, private googleAuth: GoogleAuthService,) { }

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
            throw new InternalServerErrorException(
                'Rol USER no existe en la base de datos',
            );
        }

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                name: dto.name,
                subname: dto.subname,
                roles: {
                    create: [{ role: { connect: { id: userRole.id } } }],
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
                roles: { include: { role: true } },
            },
        });

        const roles = user.roles.map((ur) => ur.role.name as RoleName);

        const accessToken = await this.jwt.signAsync({
            sub: user.id,
            email: user.email,
            roles,
        });

        return {
            message: 'Usuario registrado correctamente',
            user,
            accessToken,
        };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: {
                roles: { include: { role: true } },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        if (!user.password) {
            throw new UnauthorizedException('Esta cuenta debe iniciar sesion con Google');
        }

        const ok = await bcrypt.compare(dto.password, user.password);
        if (!ok) throw new UnauthorizedException('Credenciales incorrectas');

        const roles = user.roles.map((ur) => ur.role.name as RoleName);

        const accessToken = await this.jwt.signAsync({
            sub: user.id,
            email: user.email,
            roles,
        });

        return {
            message: 'Login correcto',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                subname: user.subname,
                address: user.address,
                dni: user.dni,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                roles: user.roles,
            },
            accessToken,
        };
    }
    async googleLogin(idToken: string) {
    const g = await this.googleAuth.verifyIdToken(idToken);

    if (!g.emailVerified) {
      throw new UnauthorizedException('Email de Google no verificado');
    }

    const userRole = await this.prisma.role.findUnique({
      where: { name: RoleName.USER },
      select: { id: true },
    });

    if (!userRole) {
      throw new InternalServerErrorException('Rol USER no existe en la base de datos');
    }

    const name = (g.name ?? 'GoogleUser').slice(0, 50);
    const subname = (g.surname ?? '').slice(0, 150);

    const user = await this.prisma.user.upsert({
      where: { email: g.email },
      update: {
        name,
        subname,
        avatarUrl: g.avatarUrl ?? null,
      },
      create: {
        email: g.email,
        password: null,
        name,
        subname: subname.length ? subname : 'Google',
        avatarUrl: g.avatarUrl ?? null,
        roles: {
          create: [{ role: { connect: { id: userRole.id } } }],
        },
      },
      include: {
        roles: { include: { role: true } },
      },
    });

    const roles = user.roles.map((ur) => ur.role.name as RoleName);

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      roles,
    });

    return {
      message: 'Login con Google correcto',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subname: user.subname,
        avatarUrl: (user as any).avatarUrl ?? undefined,
        roles: user.roles,
      },
      accessToken,
    };
  }
}