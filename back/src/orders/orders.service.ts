import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketsGateway } from '../websockets/websockets.gateway';

const USER_SELECT = { id: true, name: true, subname: true, email: true };

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wsGateway: WebsocketsGateway,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const order = await this.prisma.order.create({
      data: createOrderDto,
      include: { user: { select: USER_SELECT } },
    });
    this.wsGateway.emitNewOrder(order);
    return order;
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: { user: { select: USER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { user: { select: USER_SELECT } },
    });
    if (!order) throw new NotFoundException(`Encargo #${id} no encontrado`);
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: { user: { select: USER_SELECT } },
    });
    this.wsGateway.emitOrderUpdated(order);
    return order;
  }

  async remove(id: number) {
    return this.prisma.order.delete({ where: { id } });
  }


  async getPopular() {
  
    const pageConfig = await this.prisma.page.findFirst({
      where: {stage:'orders_popular'},
    })
  
    if(!pageConfig || !pageConfig.contentJson){
      return [];
    }


    let parsedJson: any[];
    try{
      parsedJson = typeof pageConfig.contentJson === 'string' 
       ? JSON.parse(pageConfig.contentJson)
       : pageConfig.contentJson;
    }catch(e){
      return [];
      console.log("Error parseando JSON, "+ e);
    }

    const orderIds = parsedJson.map((item) => Number(item.id));

    if(orderIds.length === 0){
      return [];
    }


    const orders = await this.prisma.order.findMany({
      where: {
        id: {in:orderIds},
        active:true 
      },
    })

    return parsedJson.map((pageItem)=>{
      const orderData = orders.find((o) => o.id === Number(pageItem.id));
      
      if(!orderData){
        return null;
      }

      return {
        id:orderData.id,
        title: orderData.title,
        image:orderData.imageAfter || null,
        price: orderData.price || null,
        timeInitial: orderData.timeInitial || null,
        timeFinal: orderData.timeFinal || null,
      };
    }).filter(Boolean);
  }


  async getCarrusel(){
    const pageConfig = await this.prisma.page.findFirst({
      where: {stage:'orders_carousel'},
    })

    if(!pageConfig || !pageConfig.contentJson){
      return [];
    }
    let parsedJson: any[];
    try{
      parsedJson = typeof pageConfig.contentJson ==='string'
       ? JSON.parse(pageConfig.contentJson)
       : pageConfig.contentJson;
    }catch(e){
      console.log("Error parseando JSON, "+ e);
      return [];
    }

    const orderIds = parsedJson.map((item) => Number(item.id));
    if(orderIds.length === 0){
      return [];
    }
    const orders = await this.prisma.order.findMany({
      where: {
        id: {in:orderIds},
        active:true 
      },
    });

    return parsedJson.map((pageItem)=>{
      const orderData = orders.find((o) => o.id === Number(pageItem.id));
      
      if(!orderData){
        return null;
      }

      return {
        id: orderData.id,
        title: orderData.title,
        image: orderData.imageAfter || null,
      }
    
    }).filter(Boolean);
  
  }
  async findAllActive(){
    return this.prisma.order.findMany({
      where: {active:true},
      select: {
        id: true,
        title: true,
        imageAfter: true,
        price: true,
        timeInitial: true,
        timeFinal: true,
      },
      orderBy: {id: 'desc'}
    });
  }

  async updatePageConfig(stage: string, ids: number[]){
    const jsonContent = ids.map(id=>({id}));

    const existingPage = await this.prisma.page.findFirst({
      where: {stage},
    })

    if(existingPage){
      return this.prisma.page.update({
        where: {id:existingPage.id},
        data:{contentJson: jsonContent}
      })
    } else {
      return this.prisma.page.create({
        data:{stage, contentJson: jsonContent}
      });
    }
  }


  async getHeaderConfig(){
    const pageConfig = await this.prisma.page.findFirst({
      where: {stage:'orders_header'},
    });

    if(!pageConfig || !pageConfig.contentJson){
      return {
        badge: "TÚ LO IMAGINAS, NOSOTROS LO CREAMOS",
        badgeStyle: "Normal",
        title: "Encargos Personalizados",
        titleStyle: "Destacado",
        description: "¿Tienes una idea especial? En Fundación Fuente Agria realizamos trabajos a medida para bodas, eventos corporativos o regalos únicos. Cuéntanos tu idea y le daremos forma.",
        descriptionStyle: "Normal"
      };
    }

    return typeof pageConfig.contentJson === 'string' 
      ? JSON.parse(pageConfig.contentJson) 
      : pageConfig.contentJson;
    
  }

  async updateHeaderConfig(data: any) {
    const existingPage = await this.prisma.page.findFirst({
      where: { stage: 'orders_header' },
    });

    if (existingPage) {
      return this.prisma.page.update({
        where: { id: existingPage.id },
        data: { contentJson: data },
      });
    } else {
      return this.prisma.page.create({
        data: {
          stage: 'orders_header',
          contentJson: data,
        },
      });
    }
  }
}
