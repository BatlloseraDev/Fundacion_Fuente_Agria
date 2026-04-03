import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/auth/jwt_strategy/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Get('popular')
  async getPopularOrders() {
    return this.ordersService.getPopular();
  }

  @Get('carrusel')
  async getCarruselOrders() {
    return this.ordersService.getCarrusel();
  }

  @Get('allActive')
  async getAllActiveOrders() {
    return this.ordersService.findAllActive();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('page-config')
  async updatePageConfig(@Body() body: { stage: string, ids: number[] }) {
    return this.ordersService.updatePageConfig(body.stage, body.ids);
  }

  @Get('header')
  async getHeaderConfig() {
    return this.ordersService.getHeaderConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('header')
  async updateHeaderConfig(@Body() body: any) {
    return this.ordersService.updateHeaderConfig(body);
  }


  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }





}
