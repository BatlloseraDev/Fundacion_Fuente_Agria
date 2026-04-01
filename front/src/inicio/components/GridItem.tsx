import type { GridItem as GridItemType } from '../types/inicio.interface';
import { ComponenteEditable } from './ComponenteEditable';

interface GridItemProps extends GridItemType {
    modoEditor?: boolean;
}

export const GridItem = ({ titulo, descripcion, icono, colorTema, textoEnlace, modoEditor = false }: GridItemProps) => {
    return (
        <div className="card h-100 border-0 shadow-sm rounded-4 p-4 transition-all">
            
            <div 
                className={`bg-${colorTema} bg-opacity-10 text-${colorTema} rounded-4 d-inline-flex align-items-center justify-content-center mb-4`}
                style={{ width: '60px', height: '60px' }}
            >
                <i className={`bi ${icono} fs-2`}></i>
            </div>

            <ComponenteEditable 
                modoEditor={modoEditor} 
                onEditClick={() => alert('Editar el título')}
            >
            
            <h3 className="h4 fw-bold">{titulo}</h3>

            </ComponenteEditable>

            <ComponenteEditable 
                modoEditor={modoEditor} 
                onEditClick={() => alert('Editar el texto')}
            >
            
            <p className="text-secondary small">
                {descripcion}
            </p>

            </ComponenteEditable>
            
            <a href="#" className={`mt-auto text-decoration-none fw-bold text-${colorTema} ${!modoEditor ? 'stretched-link' : ''}`}>
                {textoEnlace} <i className="bi bi-arrow-right ms-1"></i>
            </a>
            
        </div>
    );
};