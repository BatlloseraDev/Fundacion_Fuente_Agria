export interface Videotutorial {
  id: string;
  titulo: string;
  descripcion: string;
  pasos: string[];
  videoId: string; // YouTube video ID
  icono?: string; // Bootstrap icon class
}