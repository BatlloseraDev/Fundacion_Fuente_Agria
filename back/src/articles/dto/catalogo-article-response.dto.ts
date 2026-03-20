export class CatalogoArticleResponseDto {
  id: number;
  name: string;
  description: string;
  longDescription: string | null;
  price: number;
  available: boolean;
  image: string | null;
  categories: {
    id: number;
    name: string;
    color: string | null;
  }[];
  labels: {
    id: number;
    name: string;
    color: string | null;
  }[];
}