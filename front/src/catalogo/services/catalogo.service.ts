import type { Producto } from '../types/producto.interface';

interface BackendCategory {
    id: number;
    name: string;
    color?: string | null;
}

interface BackendLabel {
    id: number;
    name: string;
    color?: string | null;
}

interface BackendArticle {
    id: number;
    name: string;
    description: string;
    longDescription?: string | null;
    price: number;
    available: boolean;
    image?: string | null;
    categories?: BackendCategory[];
    labels?: BackendLabel[];
}

interface CatalogoResponse {
    success: boolean;
    message: string;
    data: BackendArticle[];
}

const formatearPrecio = (precio: number): string => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(precio);
};

const mapArticleToProducto = (article: BackendArticle): Producto => {
    const categoriaPrincipal = article.categories?.[0];

    return {
        id: String(article.id),
        nombre: article.name,
        descripcion: article.description,
        descripcionDetallada: article.longDescription || article.description,
        precio: formatearPrecio(article.price),
        precioDesde: false,
        categoria: categoriaPrincipal?.name || 'Sin categoria',
        colorCategoria: categoriaPrincipal?.color || 'secondary',
        imageUrl: article.image || '/imgs/img-placeholder.jpg',
        disponible: article.available,
        etiquetas: article.labels?.map((item) => item.name) || []
    };
};

export const getCatalogo = async (): Promise<Producto[]> => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/articles/catalogo`);

    if (!response.ok) {
        throw new Error('No se pudo cargar el catalogo');
    }

    const json: CatalogoResponse = await response.json();

    if (!Array.isArray(json.data)) {
        throw new Error('La respuesta del backend no contiene un array en data');
    }

    return json.data.map(mapArticleToProducto);
};