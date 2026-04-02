import { useState, useEffect } from 'react';

interface ModalEdicionProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (nuevoValor: string) => void;
    tituloModal: string;
    valorInicial: string;
}

export const ModalEdicion = ({ isOpen, onClose, onSave, tituloModal, valorInicial }: ModalEdicionProps) => {
    const [valor, setValor] = useState(valorInicial);

    useEffect(() => {
        if (isOpen) {
            setValor(valorInicial);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, valorInicial]);

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-backdrop show" style={{ zIndex: 1040 }} onClick={onClose} />
            
            <div className="modal d-block" style={{ zIndex: 1050 }} role="dialog">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4 p-2">
                        
                        <div className="modal-header border-bottom-0">
                            <h5 className="modal-title fw-bold fs-5">{tituloModal}</h5>
                            <button type="button" className="btn-close" onClick={onClose} />
                        </div>
                        
                        <div className="modal-body">
                            <textarea 
                                className="form-control form-control-lg rounded-3 text-secondary"
                                rows={4}
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                autoFocus
                            />
                        </div>
                        
                        <div className="modal-footer border-top-0 d-flex gap-2">
                            <button className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary rounded-pill px-4 fw-semibold" onClick={() => onSave(valor)}>
                                Guardar cambios
                            </button>
                        </div>
                        
                    </div>
                </div>
            </div>
        </>
    );
};