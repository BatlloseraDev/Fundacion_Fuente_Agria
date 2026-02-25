import type { GridItem as GridItemType } from '../types/inicio.interface';

export const GridItem = ({ titulo, descripcion, icono, colorTema, textoEnlace }: GridItemType) => {
    return (
        <div className="card h-100 border-0 shadow-sm rounded-4 p-4 transition-all">
            
            <div 
                className={`bg-${colorTema} bg-opacity-10 text-${colorTema} rounded-4 d-inline-flex align-items-center justify-content-center mb-4`}
                style={{ width: '60px', height: '60px' }}
            >
                <i className={`bi ${icono} fs-2`}></i>
            </div>
            
            <h3 className="h4 fw-bold">{titulo}</h3>
            
            <p className="text-secondary small">
                {descripcion}
            </p>
            
            <a href="#" className={`mt-auto text-decoration-none fw-bold text-${colorTema} stretched-link`}>
                {textoEnlace} <i className="bi bi-arrow-right ms-1"></i>
            </a>
            
        </div>
    );
};