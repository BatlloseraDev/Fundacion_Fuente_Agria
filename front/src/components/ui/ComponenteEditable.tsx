import { useState } from 'react';
import type { ReactNode } from 'react';

export type TipoEdicion = 'texto' | 'diapositiva';

interface ComponenteEditableProps {
    children: ReactNode;
    modoEditor: boolean;
    onEditClick: () => void;
    tipo?: TipoEdicion; 
}

export const ComponenteEditable = ({ children, modoEditor, onEditClick, tipo = 'texto' }: ComponenteEditableProps) => {
    const [isHovered, setIsHovered] = useState(false);
    
    if (!modoEditor) return <>{children}</>;

    const getIcono = () => {
        return 'bi-pencil-fill'; 
    };

    return (
        <div 
            className={`position-relative p-1 rounded-3 transition-all ${isHovered ? 'bg-primary bg-opacity-10' : ''}`}
            style={{ 
                outline: isHovered ? '2px dashed #0d6efd' : '2px dashed transparent', 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation(); 
                onEditClick();
            }}
        >
            <button 
                className={`btn btn-primary btn-sm rounded-circle shadow position-absolute top-0 start-0 translate-middle d-flex align-items-center justify-content-center z-3 transition-all`}
                style={{ 
                    width: '32px', 
                    height: '32px',
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? 'scale(1)' : 'scale(0.8)'
                }}
            >
                <i className={`bi ${getIcono()}`}></i>
            </button>
            
            {children}
        </div>
    );
};