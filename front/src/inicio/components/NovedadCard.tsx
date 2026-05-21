import type { NovedadItem } from '../types/inicio.interface';
import { ComponenteEditable } from '../../components/ui/ComponenteEditable';

interface NovedadCardProps extends NovedadItem {
    modoEditor?: boolean;
    onEditClick?: () => void;
}

export const NovedadCard = ({ imagenUrl, etiqueta, fecha, titulo, descripcion, enlace, modoEditor = false, onEditClick }: NovedadCardProps) => {
    return (
        <ComponenteEditable 
            modoEditor={modoEditor} 
            tipo="diapositiva" 
            onEditClick={() => onEditClick && onEditClick()}
        >
            <div className="card h-100 border shadow-sm rounded-4 overflow-hidden transition-all">
                
                <img 
                    src={imagenUrl} 
                    alt={titulo} 
                    className="card-img-top" 
                    style={{ height: '200px', objectFit: 'cover' }}
                />
                
                <div className="card-body d-flex flex-column p-4">
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span 
                            className="badge rounded-2 fw-semibold px-2 py-1" 
                            style={{ color: '#6f42c1', backgroundColor: '#f3e8ff' }}
                        >
                            {etiqueta}
                        </span>
                        <span className="text-secondary small">
                            {fecha}
                        </span>
                    </div>

                    <h3 className="h5 fw-bold mb-2">{titulo}</h3>
                    
                    <p className="card-text text-secondary small mb-4 flex-grow-1">
                        {descripcion}
                    </p>
                    
                    <a href={enlace} className="btn btn-outline-primary w-100 mt-auto rounded-3 fw-semibold" onClick={(e) => modoEditor && e.preventDefault()}>
                        Ver novedad
                    </a>
                    
                </div>
            </div>
        </ComponenteEditable>
    );
};