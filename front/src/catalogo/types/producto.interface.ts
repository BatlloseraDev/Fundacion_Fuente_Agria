export interface Producto {
    id: string;
    nombre: string;
    descripcion: string;
    descripcionDetallada: string;
    precio: string;
    precioDesde: boolean; // Si true, muestra "Desde X€"
    categoria: string;
    colorCategoria: 'primary' | 'success' | 'warning' | 'danger' | 'info' | string;
    imageUrl: string;
    disponible: boolean;
    etiquetas?: string[]; // Ej: ["Hecho a mano", "Personalizable"]
}
