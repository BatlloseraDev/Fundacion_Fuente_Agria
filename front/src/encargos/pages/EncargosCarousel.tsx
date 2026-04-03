import { useEffect, useMemo, useState } from "react";
import type { EncargoCarrusel } from "../types/encargo.types";

type Props = {
    items: EncargoCarrusel[];
    autoMs?: number;
    editMode?: boolean;
    onRemove?: (id: string | number) => void;
};

export function EncargosCarousel({ items, autoMs = 4500, editMode, onRemove}: Props) {
    const safeItems = useMemo(() => items.slice(0, 4), [items]);
    const [idx, setIdx] = useState(0);

    function prev() {
        setIdx((v) => (v - 1 + safeItems.length) % safeItems.length);
    }

    function next() {
        setIdx((v) => (v + 1) % safeItems.length);
    }

    useEffect(() => {
        if (safeItems.length <= 1) return;
        const t = window.setInterval(() => next(), autoMs);
        return () => window.clearInterval(t);
    }, [safeItems.length, autoMs]);

    if (safeItems.length === 0) return null;

    return (
        <div id="encargosCarousel" className="carousel slide position-relative" aria-label="Carrusel de encargos realizados">
            <div className="carousel-inner rounded-4 overflow-hidden border">
                {safeItems.map((it, i) => (
                    <div key={it.id} className={`carousel-item ${i === idx ? "active" : ""}`}>
                        {editMode && (
                            <div className="position-absolute top-0 end-0 m-3 z-3">
                                <button className="btn btn-danger btn-sm rounded-circle shadow" onClick={() => onRemove?.(it.id)}>
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                        )}
                        <div className="w-100 overflow-hidden bg-light" style={{ height: 360 }}>
                            <img
                                src={it.imagenUrl}
                                alt={it.alt}
                                className="w-100 h-100 d-block"
                                style={{ objectFit: "cover", objectPosition: "center" }}
                            />
                        </div>

                        <div className="carousel-caption d-none d-md-block">
                            <div className="bg-dark bg-opacity-50 rounded-3 px-3 py-2 d-inline-block">
                                <p className="mb-0 fw-semibold">{it.titulo}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                className="carousel-control-prev"
                type="button"
                onClick={prev}
                aria-label="Anterior"
            >
                <span className="carousel-control-prev-icon" aria-hidden="true" />
                <span className="visually-hidden">Anterior</span>
            </button>

            <button
                className="carousel-control-next"
                type="button"
                onClick={next}
                aria-label="Siguiente"
            >
                <span className="carousel-control-next-icon" aria-hidden="true" />
                <span className="visually-hidden">Siguiente</span>
            </button>

            <div className="carousel-indicators">
                {safeItems.map((it, i) => (
                    <button
                        key={it.id}
                        type="button"
                        aria-label={`Ir a ${i + 1}`}
                        aria-current={i === idx ? "true" : "false"}
                        className={i === idx ? "active" : ""}
                        onClick={() => setIdx(i)}
                    />
                ))}
            </div>
        </div>
    );
}