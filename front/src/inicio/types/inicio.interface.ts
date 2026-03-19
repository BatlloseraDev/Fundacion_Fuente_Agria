export interface CarouselItem {
  id: string;
  imagenUrl: string;
  titulo?: string;
  descripcion?: string;
}

export interface GridItem {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;        
  colorTema: string;   
  textoEnlace: string;  
}

export interface NovedadItem {
  id: string;
  imagenUrl: string;
  etiqueta: string;
  fecha: string;
  titulo: string;
  descripcion: string;
  enlace: string;
}

export interface ComentarioItem {
  id: string;
  texto: string;
  etiqueta: string;
  autor: string;
}