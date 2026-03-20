import type { Producto } from '../types/producto.interface';

interface BackendCategory {
    id: number;
    articleId: number;
    categoryArticleId: number;
    categoryArticle: {
        id: number;
        name: string;
        color?: string | null;
    };
}

interface BackendLabel {
    id: number;
    articleId: number;
    labelId: number;
    label: {
        id: number;
        name: string;
        color?: string | null;
    };
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

const colorMap: Record<string, string> = {
    artesania: 'primary',
    restauracion: 'warning',
    decoracion: 'info',
    solidario: 'success'
};

const formatearPrecio = (precio: number): string => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(precio);
};

const obtenerColorCategoria = (nombreCategoria?: string): string => {
    if (!nombreCategoria) return 'secondary';

    const key = nombreCategoria
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    return colorMap[key] || 'secondary';
};

const mapArticleToProducto = (article: BackendArticle): Producto => {
    const categoriaPrincipal = article.categories?.[0]?.categoryArticle;

    return {
        id: String(article.id),
        nombre: article.name,
        descripcion: article.description,
        descripcionDetallada: article.longDescription || article.description,
        precio: formatearPrecio(article.price),
        precioDesde: false,
        categoria: categoriaPrincipal?.name || 'Sin categoria',
        colorCategoria: categoriaPrincipal?.color || obtenerColorCategoria(categoriaPrincipal?.name),
        imageUrl: article.image || '/imgs/img-placeholder.jpg',
        disponible: article.available,
        etiquetas: article.labels?.map((item) => item.label.name) || []
    };
};

export const getCatalogo = async (): Promise<Producto[]> => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/articles/catalogo`);

    if (!response.ok) {
        throw new Error('No se pudo cargar el catalogo');
    }

    const data: BackendArticle[] = await response.json();
    return data.map(mapArticleToProducto);
};