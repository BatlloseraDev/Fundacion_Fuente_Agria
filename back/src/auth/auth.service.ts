import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  async register(dto: RegisterDto) {
    return { message: 'Register placeholder' };
  }

  async login(dto: LoginDto) {
    return { message: 'Login placeholder' };
  }
}