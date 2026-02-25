import type { CarouselItem, GridItem } from '../types/inicio.interface';

export const mockCarouselData: CarouselItem[] = [
  { 
    id: 'slide-1', 
    imagenUrl: '/imgs/img-stock-4.jpg', 
    titulo: 'Título de la Actividad 1', 
    descripcion: 'Descripción de la actividad' 
  },
  { 
    id: 'slide-2', 
    imagenUrl: '/imgs/img-stock-5.jpg', 
    titulo: 'Título de la Actividad 2' 
  },
  { 
    id: 'slide-3', 
    imagenUrl: '/imgs/img-stock-6.jpg' 
  }
];

export const mockGridData: GridItem[] = [
  { 
    id: 'grid-1', 
    titulo: 'Tienda', 
    descripcion: 'Productos creados a mano hechos con pasión y cariño por nuestros integrantes.', 
    icono: 'bi-house-heart', 
    colorTema: 'primary',
    textoEnlace: 'Ver catálogo'
  },
  { 
    id: 'grid-2', 
    titulo: 'Encargos', 
    descripcion: 'Realizamos trabajos personalizados para eventos, empresas o regalos especiales.', 
    icono: 'bi-briefcase', 
    colorTema: 'warning',
    textoEnlace: 'Saber más'
  },
  { 
    id: 'grid-3', 
    titulo: 'Actividades', 
    descripcion: 'Talleres y eventos grupales enfocados en la integración y el desarrollo personal.', 
    icono: 'bi-people', 
    colorTema: 'success',
    textoEnlace: 'Saber más'
  },
];