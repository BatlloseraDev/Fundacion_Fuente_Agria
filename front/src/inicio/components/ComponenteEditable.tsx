import { useState } from 'react';
import type { ReactNode } from 'react';

interface ComponenteEditableProps {
    children: ReactNode;
    modoEditor: boolean;
    onEditClick: () => void;
}

export const ComponenteEditable = ({ children, modoEditor, onEditClick }: ComponenteEditableProps) => {
    const [isHovered, setIsHovered] = useState(false);
    
    if (!modoEditor) return <>{children}</>;

    return (
        <div 
            className={`position-relative p-1 rounded-3 border border-2 ${isHovered ? 'border-primary bg-primary bg-opacity-10' : 'border-white'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onEditClick}
        >
            <button 
                className={`btn btn-primary btn-sm rounded-circle shadow position-absolute top-0 start-0 translate-middle d-flex align-items-center justify-content-center z-3 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            >
                <i className="bi bi-pencil-fill"></i>
            </button>
            
            {children}
        </div>
    );
};