import type { ComentarioItem } from '../services/inicio.service';

interface ComentarioCardProps extends ComentarioItem {
    modoEditor?: boolean;
    onEdit?: (campoBD: string, valorActual: string) => void;
}

export const ComentarioCard = ({ texto, etiqueta, autor}: ComentarioCardProps) => {
    return (
        <div className="card h-100 border-0 shadow-sm rounded-4 p-4">
            
            <p className="text-secondary mb-4 fst-italic">
                {texto}
            </p>
            
            <div className="mt-auto d-flex align-items-center gap-2">
                
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
                    {etiqueta}
                </span>
                
                <span className="text-secondary small ms-auto fw-semibold">
                    {autor}
                </span>
            </div>

        </div>
    );
};