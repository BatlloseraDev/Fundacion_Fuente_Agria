import type { GridItem } from '../types/inicio.interface';

interface BackendActionArea {
    id: number;
    title: string;
    description: string;
    icon: string;
    themeColor: string;
    linkText: string;
}

const mapBackendToGridItem = (area: BackendActionArea): GridItem => {
    return {
        id: String(area.id),
        titulo: area.title,
        descripcion: area.description,
        icono: area.icon,
        colorTema: area.themeColor,
        textoEnlace: area.linkText
    };
};

export const getAreasInicio = async (): Promise<GridItem[]> => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/action-areas`);

    if (!response.ok) {
        throw new Error('No se pudieron cargar las áreas de inicio');
    }

    const json = await response.json();
    return json.map(mapBackendToGridItem);
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