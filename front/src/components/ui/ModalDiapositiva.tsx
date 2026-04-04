import { useState, useEffect } from 'react';

export interface DatosDiapositiva {
    archivoImagen: File | null;
    titulo: string;
    descripcion: string;
    textoAlt?: string;
    etiqueta?: string; 
    fecha?: string;    
    enlace?: string;   
}

interface ModalDiapositivaProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (datos: DatosDiapositiva) => void;
    tituloModal: string;
    tipo: 'carrusel' | 'novedades'; 
    valoresIniciales?: Partial<DatosDiapositiva> & { imagenUrl?: string }; 
}

export const ModalDiapositiva = ({ isOpen, onClose, onSave, tituloModal, tipo, valoresIniciales }: ModalDiapositivaProps) => {
    const [archivo, setArchivo] = useState<File | null>(null);
    const [imagenPista, setImagenPista] = useState<string | null>(null);
    
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [etiqueta, setEtiqueta] = useState('');
    const [fecha, setFecha] = useState('');
    const [enlace, setEnlace] = useState('');

    useEffect(() => {
        if (isOpen) {
            setArchivo(null);
            setImagenPista(null);
            setTitulo(valoresIniciales?.titulo || '');
            setDescripcion(valoresIniciales?.descripcion || '');
            setEtiqueta(valoresIniciales?.etiqueta || '');
            setFecha(valoresIniciales?.fecha || '');
            setEnlace(valoresIniciales?.enlace || '');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, valoresIniciales]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setArchivo(file);
            setImagenPista(URL.createObjectURL(file));
        }
    };

    if (!isOpen) return null;

    const imagenMostrar = imagenPista || valoresIniciales?.imagenUrl;

    return (
        <>
            <div className="modal-backdrop show" style={{ zIndex: 1040 }} onClick={onClose} />
            
            <div className="modal d-block" style={{ zIndex: 1050 }} role="dialog">
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content border-0 shadow-lg rounded-4 p-3">
                        
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                                {tituloModal}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="row g-4">
                                <div className="col-12 col-lg-5">
                                    <label className="d-flex flex-column align-items-center justify-content-center border rounded-4 w-100 h-100 p-4 text-center position-relative overflow-hidden transition-all bg-light"
                                           style={{ borderStyle: 'dashed !important', borderColor: '#dee2e6', minHeight: '300px', cursor: 'pointer' }}>
                                        <input type="file" className="d-none" accept="image/*" onChange={handleFileChange} />
                                        {imagenMostrar ? (
                                            <>
                                                <img src={imagenMostrar} alt="Preview" className="position-absolute w-100 h-100" style={{ objectFit: 'cover', top: 0, left: 0 }} />
                                                <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                                                    <span className="text-white fw-medium"><i className="bi bi-pencil-square me-2"></i>Cambiar imagen</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-cloud-arrow-up fs-1 text-primary mb-2"></i>
                                                <span className="text-secondary small fw-medium">Arrastra tu imagen o haz clic</span>
                                            </>
                                        )}
                                    </label>
                                </div>

                                <div className="col-12 col-lg-7">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label text-secondary small fw-semibold mb-1">Título</label>
                                            <input type="text" className="form-control rounded-3" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label text-secondary small fw-semibold mb-1">Descripción</label>
                                            <textarea className="form-control rounded-3" rows={3} style={{ resize: 'none' }} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                                        </div>

                                        {tipo === 'novedades' && (
                                            <>
                                                <div className="col-md-6">
                                                    <label className="form-label text-secondary small fw-semibold mb-1">Etiqueta</label>
                                                    <input type="text" className="form-control rounded-3" value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label text-secondary small fw-semibold mb-1">Fecha</label>
                                                    <input type="text" className="form-control rounded-3" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label text-secondary small fw-semibold mb-1">Enlace del botón (URL)</label>
                                                    <input type="text" className="form-control rounded-3" value={enlace} onChange={(e) => setEnlace(e.target.value)} />
                                                </div>
                                            </>
                                        )}

                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-footer border-top-0 pt-0 mt-2 d-flex gap-2 justify-content-end">
                            <button className="btn btn-light rounded-pill px-4 text-dark fw-medium border" onClick={onClose}>Cancelar</button>
                            <button className="btn btn-primary rounded-pill px-4 fw-medium" onClick={() => onSave({ archivoImagen: archivo, titulo, descripcion, etiqueta, fecha, enlace })}>
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};