import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}


  async create(createOrderDto: CreateOrderDto) {
    return this.prisma.order.create({
      data: createOrderDto,
    });
    
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
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
