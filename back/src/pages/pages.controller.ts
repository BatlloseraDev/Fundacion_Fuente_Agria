import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../auth/jwt_strategy/jwt-auth.guard';

const FOOTER_DEFAULT = {
  description: 'Encargos de artesanía y servicio de reparación y restauración de muebles de madera.',
  contact: {
    address: 'Puertollano, Ciudad Real',
    phone: '+34 900 000 000',
    email: 'contacto@fuenteagria.org',
    hours: 'L–V 9:00–14:00',
  },
  collaborators: [
    { id: '1', name: 'CCM',     imageUrl: '/imgs/Logo_CCM.png' },
    { id: '2', name: 'ASPADES', imageUrl: '/imgs/Logo_ASPADES.png' },
  ],
};

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get('footer')
  getFooter() {
    return this.pagesService.getConfig('footer', FOOTER_DEFAULT);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('footer')
  saveFooter(@Body() body: any) {
    return this.pagesService.saveConfig('footer', body);
  }
}
