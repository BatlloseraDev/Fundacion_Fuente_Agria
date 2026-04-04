import type { GridItem } from '../types/inicio.interface';

interface BackendActionArea {
    id: string;
    title: string;
    description: string;
    icon: string;
    themeColor: string;
    linkText: string;
    titleStyle?: string;       
    descriptionStyle?: string;
}

export interface ComentarioItem {
    id: string;
    texto: string;
    etiqueta: string;
    autor: string;
}

interface BackendComentario {
    id: string;
    texto: string;
    etiqueta: string;
    autor: string;
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
        textoEnlace: item.linkText,
        titleStyle: item.titleStyle || 'Normal',      
        descriptionStyle: item.descriptionStyle || 'Normal' 
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

export const getComentariosInicio = async (): Promise<ComentarioItem[]> => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/comentarios-inicio`);

    if (!response.ok) {
        throw new Error('No se pudieron cargar los comentarios');
    }

    const json = await response.json();
    const datosArray = Array.isArray(json) ? json : json.data;

    if (!Array.isArray(datosArray)) {
        throw new Error('El backend no devolvió un array válido de comentarios');
    }

    return datosArray.map((item: BackendComentario) => ({
        id: item.id,
        texto: item.texto,
        etiqueta: item.etiqueta,
        autor: item.autor
    }));
};

export const updateComentarioInicio = async (id: string, datos: Partial<BackendComentario>): Promise<void> => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/comentarios-inicio/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    if (!response.ok) {
        throw new Error('Error al guardar los cambios del comentario');
    }
};