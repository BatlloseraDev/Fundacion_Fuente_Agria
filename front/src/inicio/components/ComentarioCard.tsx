import type { ComentarioItem } from '../types/inicio.interface';

export const ComentarioCard = ({ texto, etiqueta, autor }: ComentarioItem) => {
    return (
        <div className="card h-100 border shadow-sm rounded-4 transition-all">
            <div className="card-body d-flex flex-column p-4">
                
                <p className="card-text mb-4 flex-grow-1" style={{ color: '#4a5568', fontSize: '15px' }}>
                    {texto}
                </p>
                
                <div className="d-flex align-items-center mt-auto">
                    <span 
                        className="badge rounded-2 fw-semibold px-2 py-1 me-2" 
                        style={{ color: '#6f42c1', backgroundColor: '#f3e8ff' }}
                    >
                        {etiqueta}
                    </span>
                    <span className="text-secondary small">
                        {autor}
                    </span>
                </div>

            </div>
        </div>
    );
};