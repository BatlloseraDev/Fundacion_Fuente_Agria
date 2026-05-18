import { useEffect } from 'react';
import type { Producto } from '../types/producto.interface';
import { formatPrice } from '../utils/formatPrice';

interface Props {
    producto: Producto | null;
    onClose: () => void;
}

export const ProductoModal = ({ producto, onClose }: Props) => {
    // Cerrar modal con Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (producto) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [producto, onClose]);

    if (!producto) return null;
    const precioFormateado = formatPrice(producto.precio);

    return (
        <>
            {/* Backdrop */}
            <div
                className="modal-backdrop show"
                style={{ zIndex: 1040 }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="modal d-block"
                style={{ zIndex: 1050 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="productoModalLabel"
            >
                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content border-0 rounded-4 overflow-hidden shadow-lg">

                        {/* Imagen cabecera */}
                        <div style={{ maxHeight: '320px', overflow: 'hidden' }}>
                            <img
                                src={producto.imageUrl}
                                alt={producto.nombre}
                                className="w-100"
                                style={{ objectFit: 'cover', height: '320px' }}
                            />
                        </div>

                        <div className="modal-body p-4 p-lg-5">
                            {/* Categoría + cerrar */}
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <span
                                    className="badge rounded-pill px-3 py-2"
                                    style={{
                                        backgroundColor: `var(--bs-${producto.colorCategoria}-bg-subtle, #e9ecef)`,
                                        color: `var(--bs-${producto.colorCategoria}-text-emphasis, #495057)`,
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    {producto.categoria}
                                </span>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={onClose}
                                    aria-label="Cerrar"
                                />
                            </div>

                            {/* Nombre y precio */}
                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                                <h2 id="productoModalLabel" className="fw-bold mb-0" style={{ fontSize: '1.5rem' }}>
                                    {producto.nombre}
                                </h2>
                                <div className="text-end">
                                    <span className="fw-bold fs-4 text-primary">
                                        {producto.precioDesde ? `Desde ${precioFormateado}` : precioFormateado}
                                    </span>
                                </div>
                            </div>

                            {/* Disponibilidad */}
                            {producto.disponible ? (
                                <span className="badge bg-success-subtle text-success rounded-pill mb-3">
                                    <i className="bi bi-check-circle me-1"></i> Disponible
                                </span>
                            ) : (
                                <span className="badge bg-danger-subtle text-danger rounded-pill mb-3">
                                    <i className="bi bi-x-circle me-1"></i> No disponible
                                </span>
                            )}

                            {/* Descripción detallada */}
                            <p className="text-secondary lh-lg mb-4">
                                {producto.descripcionDetallada}
                            </p>

                            {/* Etiquetas */}
                            {producto.etiquetas && producto.etiquetas.length > 0 && (
                                <div className="d-flex flex-wrap gap-2 mb-4">
                                    {producto.etiquetas.map((tag) => (
                                        <span key={tag} className="badge bg-light text-dark border rounded-pill px-3 py-2">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Acciones */}
                            <div className="d-flex gap-3 flex-wrap">
                                <button
                                    className="btn btn-primary rounded-pill px-4 fw-semibold flex-grow-1"
                                    disabled={!producto.disponible}
                                >
                                    <i className="bi bi-bag-plus me-2"></i>
                                    Encargar
                                </button>
                                <button
                                    className="btn btn-outline-secondary rounded-pill px-4"
                                    onClick={onClose}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
