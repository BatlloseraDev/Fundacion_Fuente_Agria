import type { GridItem as GridItemType } from '../types/inicio.interface';
import { ComponenteEditable } from './ComponenteEditable';

interface GridItemProps extends GridItemType {
    modoEditor?: boolean;
    onEdit?: (campoBD: string, valorActual: string, estiloActual: string) => void; 
    titleStyle?: string;
    descriptionStyle?: string;
}

export const GridItem = ({ titulo, descripcion, icono, colorTema, textoEnlace, modoEditor = false, onEdit, titleStyle = 'Normal', descriptionStyle = 'Normal' }: GridItemProps) => {
    
    const getClaseEstilo = (estilo: string) => {
        if (estilo === 'Cursiva') return 'fst-italic';
        if (estilo === 'Destacado') return `text-${colorTema}`; 
        return '';
    };

    return (
        <div className="card h-100 border-0 shadow-sm rounded-4 p-4 transition-all">
            <div className={`bg-${colorTema} bg-opacity-10 text-${colorTema} rounded-4 d-inline-flex align-items-center justify-content-center mb-4`} style={{ width: '60px', height: '60px' }}>
                <i className={`bi ${icono} fs-2`}></i>
            </div>

            <ComponenteEditable 
                modoEditor={modoEditor} 
                tipo="texto" 
                onEditClick={() => onEdit && onEdit('title', titulo, titleStyle)}
            >
                <h3 className={`h4 fw-bold ${getClaseEstilo(titleStyle)}`}>{titulo}</h3>
            </ComponenteEditable>

            <ComponenteEditable 
                modoEditor={modoEditor} 
                tipo="texto"
                onEditClick={() => onEdit && onEdit('description', descripcion, descriptionStyle)}
            >
                <p className={`text-secondary small ${getClaseEstilo(descriptionStyle)}`}>{descripcion}</p>
            </ComponenteEditable>
            
            <a href="#" className={`mt-auto text-decoration-none fw-bold text-${colorTema} ${!modoEditor ? 'stretched-link' : ''}`}>
                {textoEnlace} <i className="bi bi-arrow-right ms-1"></i>
            </a>
        </div>
    );
};