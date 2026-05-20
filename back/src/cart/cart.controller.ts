import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt_strategy/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { RoleName } from '../common/types/role-name.enum';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: any) {
    this.assertUserCanReserve(req.user);
    return this.cartService.getActiveCart(req.user.id);
  }

  @Post('items')
  addItem(@Req() req: any, @Body() dto: AddCartItemDto) {
    this.assertUserCanReserve(req.user);
    return this.cartService.addItem(req.user.id, dto.articleId, dto.quantity);
  }

  @Patch('items/:articleId')
  updateItem(
    @Req() req: any,
    @Param('articleId', ParseIntPipe) articleId: number,
    @Body() dto: AddCartItemDto,
  ) {
    this.assertUserCanReserve(req.user);
    return this.cartService.setItemQuantity(req.user.id, articleId, dto.quantity);
  }

  @Delete('items/:articleId')
  removeItem(
    @Req() req: any,
    @Param('articleId', ParseIntPipe) articleId: number,
  ) {
    this.assertUserCanReserve(req.user);
    return this.cartService.removeItem(req.user.id, articleId);
  }

  @Delete()
  clearCart(@Req() req: any) {
    this.assertUserCanReserve(req.user);
    return this.cartService.clearCart(req.user.id);
  }

  @Post('reserve')
  reserve(@Req() req: any) {
    this.assertUserCanReserve(req.user);
    return this.cartService.reserve(req.user.id);
  }

  @Get('reservations')
  findReservations() {
    return this.cartService.findReservations();
  }

  @Patch('reservations/:id/cancel')
  cancelReservation(@Param('id', ParseIntPipe) id: number) {
    return this.cartService.cancelReservation(id);
  }

  @Patch('reservations/:id/collect')
  collectReservation(@Param('id', ParseIntPipe) id: number) {
    return this.cartService.collectReservation(id);
  }

  private assertUserCanReserve(user: any) {
    const roles = (user?.roles ?? []).map((item: any) =>
      String(item?.role?.name ?? item?.name ?? item).toUpperCase(),
    );

    const isStaff = roles.some((role: string) =>
      [RoleName.ADMIN, RoleName.EDITOR, RoleName.COLABORADOR].includes(role as RoleName),
    );

    if (isStaff || !roles.includes(RoleName.USER)) {
      throw new BadRequestException('Solo los usuarios pueden realizar reservas');
    }
  }
}
