import { useState, useEffect } from 'react';

interface ModalEdicionProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (nuevoValor: string, estiloSeleccionado: string) => void; 
    tituloModal: string;
    valorInicial: string;
}

export const ModalEdicion = ({ isOpen, onClose, onSave, tituloModal, valorInicial }: ModalEdicionProps) => {
    const [valor, setValor] = useState(valorInicial);
    const [estilo, setEstilo] = useState('Normal');

    useEffect(() => {
        if (isOpen) {
            setValor(valorInicial);
            setEstilo('Normal');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, valorInicial]);

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-backdrop show" style={{ zIndex: 1040 }} onClick={onClose} />
            
            <div className="modal d-block" style={{ zIndex: 1050 }} role="dialog">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4 p-3">
                        
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold text-dark">{tituloModal}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="mb-4">
                                <label className="form-label text-secondary small fw-semibold mb-1">Contenido</label>
                                <textarea 
                                    className="form-control rounded-3"
                                    rows={4}
                                    value={valor}
                                    onChange={(e) => setValor(e.target.value)}
                                    placeholder="Escribe el texto aquí..."
                                    autoFocus
                                    style={{ resize: 'none' }}
                                />
                            </div>

                            <div className="mb-2">
                                <label className="form-label text-secondary small fw-semibold mb-1">Estilo (Opcional)</label>
                                <select 
                                    className="form-select rounded-3 text-secondary"
                                    value={estilo}
                                    onChange={(e) => setEstilo(e.target.value)}
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="Destacado">Destacado</option>
                                    <option value="Cursiva">Cursiva</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="modal-footer border-top-0 pt-0 d-flex gap-2 justify-content-end">
                            <button className="btn btn-light rounded-pill px-4 text-dark fw-medium border" onClick={onClose}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary rounded-pill px-4 fw-medium" onClick={() => onSave(valor, estilo)}>
                                Guardar Cambios
                            </button>
                        </div>
                        
                    </div>
                </div>
            </div>
        </>
    );
};