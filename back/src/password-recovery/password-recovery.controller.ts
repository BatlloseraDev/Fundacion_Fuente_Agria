import { Controller, Post, Body } from '@nestjs/common';
import { PasswordRecoveryService } from './password-recovery.service';

@Controller('auth/recovery')
export class PasswordRecoveryController {
  constructor(private readonly recoveryService: PasswordRecoveryService) {}

  @Post('request')
  async requestReset(@Body('email') email: string) {
    return this.recoveryService.requestPasswordReset(email);
  }

  @Post('reset')
  async resetPassword(
    @Body('email') email: string,
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.recoveryService.resetPassword(email, token, newPassword);
  }
}