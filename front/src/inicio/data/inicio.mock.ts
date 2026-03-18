import type { CarouselItem, GridItem,  NovedadItem} from '../types/inicio.interface';

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

export const novedadesMock: NovedadItem[] = [
  {
    id: 'novedades-1', 
    imagenUrl: '/imgs/novedades-1.jpg', 
    etiqueta: "Eventos",
    fecha: "01/02/2026",
    titulo: "Taller abierto: iniciación a la cerámica",
    descripcion: "Sesión práctica para conocer técnicas básicas y apoyar la inclusión a través del aprendizaje.",
    enlace: "#"
  },
  {
    id: 'novedades-2',
    imagenUrl: '/imgs/novedades-2.jpg', 
    etiqueta: "Artesanías",
    fecha: "24/01/2026",
    titulo: "Nueva línea de productos en madera reciclada",
    descripcion: "Pequeñas piezas decorativas creadas con restos de madera recuperada y acabados naturales.",
    enlace: "#"
  },
  {
    id: 'novedades-3',
    imagenUrl: '/imgs/novedades-3.jpg', 
    etiqueta: "Restauración",
    fecha: "18/01/2026",
    titulo: "Restauración solidaria: antes y después (enero)",
    descripcion: "Hemos finalizado 6 restauraciones con barnices al agua y reparaciones estructurales.",
    enlace: "#"
  },
  {
    id: 'novedades-4',
    imagenUrl: '/imgs/novedades-4.jpg', 
    etiqueta: "Voluntariado",
    fecha: "10/01/2026",
    titulo: "Buscamos voluntariado para recogida y logística",
    descripcion: "Si puedes ayudar un par de horas a la semana, tu apoyo marca la diferencia.",
    enlace: "#"
  },
  {
    id: 'novedades-5',
    imagenUrl: '/imgs/novedades-5.jpg', 
    etiqueta: "Proyecto social",
    fecha: "20/12/2025",
    titulo: "Proyecto social: formación en oficios artesanos",
    descripcion: "Acompañamos a personas en itinerarios formativos que conectan habilidades con empleo.",
    enlace: "#"
  },
  {
    id: 'novedades-6',
    imagenUrl: '/imgs/novedades-6.jpg',
    etiqueta: "Artesanías",
    fecha: "05/12/2025",
    titulo: 'Campaña "Regala con impacto" (edición invierno)',
    descripcion: "Encargos personalizados para empresas y particulares con empaquetado sostenible.",
    enlace: "#"
  }
];