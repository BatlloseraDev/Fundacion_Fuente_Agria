import type { GridItem } from '../types/inicio.interface';

interface BackendActionArea {
    id: string;
    title: string;
    description: string;
    icon: string;
    themeColor: string;
    linkText: string;
}

export const getAreasInicio = async (): Promise<GridItem[]> => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/action-areas`);

    if (!response.ok) {
        throw new Error('No se pudieron cargar las áreas de acción');
    }

    const json = await response.json();
    
    const datosArray = Array.isArray(json) ? json : json.data;

    if (!Array.isArray(datosArray)) {
        console.error("Respuesta inesperada del backend:", json);
        throw new Error('El backend no devolvió un array válido');
    }

    return datosArray.map((item: BackendActionArea) => ({
        id: item.id,
        titulo: item.title,
        descripcion: item.description,
        icono: item.icon,
        colorTema: item.themeColor,
        textoEnlace: item.linkText
    }));
};

export const updateAreaInicio = async (id: string, datos: Partial<BackendActionArea>): Promise<void> => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/action-areas/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos)
    });

    if (!response.ok) {
        throw new Error('Error al guardar los cambios en la base de datos');
    }
};