import { useEffect, useState } from "react";
import { getAllOrders, type BackendOrderData } from "../services/encargos.service";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (selectedItem: BackendOrderData) => void;
    title: string;
}

export function SeleccionarEncargosModal({ isOpen, onClose, onSelect, title }: Props) {
    const [encargos, setEncargos] = useState<BackendOrderData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            getAllOrders().then(setEncargos).finally(() => setLoading(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.55)", zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                <div className="modal-content rounded-4 border-0 shadow">
                    <div className="modal-header">
                        <h5 className="modal-title fw-bold text-primary">{title}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {loading ? <p>Cargando encargos...</p> : (
                            <div className="row g-3">
                                {encargos.map((item) => (
                                    <div key={item.id} className="col-12 col-md-6">
                                        <div className="card h-100 p-2 d-flex flex-row align-items-center gap-3">
                                            <img src={item.imageAfter || '/imgs/placeholder-encargo.jpg'} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                                            <div className="flex-grow-1">
                                                <h6 className="mb-0 fw-semibold">{item.title}</h6>
                                            </div>
                                            <button className="btn btn-sm btn-outline-success rounded-pill" onClick={() => { onSelect(item); onClose(); }}>
                                                Añadir
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

}