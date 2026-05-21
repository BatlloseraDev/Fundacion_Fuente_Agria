import { formatPrice } from '../utils/formatPrice';
import type { CartResponse } from '../services/catalogo.service';

const API_URL = import.meta.env.VITE_API_URL;

function imageUrl(image?: string | null) {
    if (!image) return '';
    return image.startsWith('/uploads/') ? `${API_URL}${image}` : image;
}

interface Props {
    cart: CartResponse | null;
    open: boolean;
    loading: boolean;
    error: string;
    ticketCode: string;
    onClose: () => void;
    onUpdateQuantity: (articleId: number, quantity: number) => void;
    onRemove: (articleId: number) => void;
    onReserve: () => void;
}

export function CarritoModal({
    cart,
    open,
    loading,
    error,
    ticketCode,
    onClose,
    onUpdateQuantity,
    onRemove,
    onReserve,
}: Props) {
    if (!open) return null;

    const items = cart?.items ?? [];
    const total = items.reduce(
        (sum, item) => sum + item.quantity * Number(item.article.price ?? 0),
        0,
    );

    return (
        <>
            <div className="modal-backdrop show" style={{ zIndex: 1040 }} onClick={onClose} />
            <div className="modal d-block" style={{ zIndex: 1050 }} role="dialog" aria-modal="true">
                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content border-0 rounded-4 shadow-lg">
                        <div className="modal-header border-0 pb-0">
                            <div>
                                <h5 className="modal-title fw-bold">Tu carrito</h5>
                                <p className="text-secondary small mb-0">
                                    Revisa tus productos antes de reservar.
                                </p>
                            </div>
                            <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose} />
                        </div>

                        <div className="modal-body">
                            {error && <div className="alert alert-danger rounded-3">{error}</div>}
                            {ticketCode && (
                                <div className="alert alert-success rounded-3">
                                    Reserva creada correctamente. Ticket: <strong>{ticketCode}</strong>
                                </div>
                            )}

                            {items.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="bi bi-cart text-secondary" style={{ fontSize: '2.5rem' }} />
                                    <p className="text-secondary mt-3 mb-0">Todavia no hay productos en el carrito.</p>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {items.map((item) => (
                                        <div key={item.articleId} className="d-flex gap-3 align-items-center border rounded-3 p-3">
                                            <img
                                                src={imageUrl(item.article.image)}
                                                alt={item.article.name}
                                                className="rounded-3"
                                                style={{ width: 82, height: 72, objectFit: 'cover', background: '#f3f4f6' }}
                                            />
                                            <div className="flex-grow-1">
                                                <div className="fw-semibold">{item.article.name}</div>
                                                <div className="text-secondary small">
                                                    {formatPrice(String(item.article.price))} unidad
                                                </div>
                                            </div>
                                            <div className="input-group input-group-sm" style={{ width: 132 }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    disabled={item.quantity <= 1 || loading}
                                                    onClick={() => onUpdateQuantity(item.articleId, item.quantity - 1)}
                                                >
                                                    -
                                                </button>
                                                <input className="form-control text-center" value={item.quantity} readOnly />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    disabled={loading || item.article.stock <= 0}
                                                    onClick={() => onUpdateQuantity(item.articleId, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm rounded-pill"
                                                disabled={loading}
                                                onClick={() => onRemove(item.articleId)}
                                            >
                                                Quitar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer border-0 pt-0 d-block">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="text-secondary">Total estimado</span>
                                <strong className="fs-5">{formatPrice(String(total))}</strong>
                            </div>
                            <p className="small text-secondary mb-3">
                                Si no se presenta en 3 dias habiles su reserva quedara anulada.
                            </p>
                            <div className="d-flex gap-2 justify-content-end">
                                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
                                    Cerrar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary rounded-pill px-4 fw-semibold"
                                    disabled={items.length === 0 || loading}
                                    onClick={onReserve}
                                >
                                    {loading ? 'Reservando...' : 'Reservar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
