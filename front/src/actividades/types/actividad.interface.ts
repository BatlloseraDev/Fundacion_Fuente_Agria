export interface ContentBlock {
  type: 'text' | 'image';
  content: string;
}

export interface CategoriaActividad {
  id: number;
  name: string;
  color: string | null;
}

export interface Actividad {
  id: number;
  title: string;
  description: string;
  date: string;
  coverImage: string | null;
  categoryId: number | null;
  category: CategoriaActividad | null;
  blocks: ContentBlock[];
  createdAt: string;
  updatedAt: string;
}
