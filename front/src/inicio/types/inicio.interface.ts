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