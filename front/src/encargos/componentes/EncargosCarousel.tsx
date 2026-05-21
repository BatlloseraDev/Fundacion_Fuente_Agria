import { useEffect, useMemo, useState } from "react";
import type { EncargoCarrusel } from "../types/encargo.types";

type Props = {
    items: EncargoCarrusel[];
    autoMs?: number;
    editMode?: boolean;
    onRemove?: (id: string) => void;
};

export function EncargosCarousel({ items, autoMs = 4500, editMode, onRemove }: Props) {
    const safeItems = useMemo(() => items || [], [items]);
    const [idx, setIdx] = useState(0);

    // Derivar un índice seguro para evitar que la vista "parpadee" en blanco si eliminamos el elemento actual
    const activeIdx = safeItems.length > 0 && idx >= safeItems.length ? safeItems.length - 1 : idx;

    // Ajustar el estado real de fondo si ha quedado desfasado tras borrar elementos
    useEffect(() => {
        if (idx !== activeIdx) setIdx(activeIdx);
    }, [idx, activeIdx]);

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

    if (safeItems.length === 0) {
        if (!editMode) return null;
        return (
            <div className="bg-light border rounded-4 d-flex flex-column align-items-center justify-content-center text-secondary" style={{ height: 360 }}>
                <i className="bi bi-images fs-1 mb-2"></i>
                <p className="mb-0">El carrusel está vacío. Añade encargos para mostrarlos aquí.</p>
            </div>
        );
    }

    return (
        <div id="encargosCarousel" className="carousel slide position-relative" aria-label="Carrusel de encargos realizados">
            <div className="carousel-inner rounded-4 overflow-hidden border">
                {safeItems.map((it, i) => (
                    <div key={it.id} className={`carousel-item ${i === activeIdx ? "active" : ""}`}>
                        {editMode && (
                            <div className="position-absolute top-0 end-0 m-3 z-3">
                                <button className="btn btn-danger btn-sm rounded-circle shadow" onClick={() => onRemove?.(it.id)}>
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                        )}
                        <div className="w-100 overflow-hidden bg-black position-relative d-flex justify-content-center align-items-center" style={{ height: 360 }}>

                            {/* 1. Imagen de fondo estirada y desenfocada (Efecto Ambient) */}
                            <img
                                src={it.imagenUrl}
                                alt=""
                                className="position-absolute top-0 start-0 w-100 h-100"
                                style={{
                                    objectFit: "cover", // Estira para cubrir todo
                                    filter: "blur(25px)", // Desenfoque alto
                                    opacity: 0.5, // Medio transparente para que se funda con el negro
                                    transform: "scale(1.1)" // Evita bordes blancos por el blur
                                }}
                            />

                            {/* 2. Imagen principal nítida encima */}
                            <img
                                src={it.imagenUrl}
                                alt={it.alt}
                                className="position-relative h-100 w-100"
                                style={{
                                    objectFit: "contain",
                                    objectPosition: "center",
                                    zIndex: 1
                                }}
                            />
                        </div>

                        {/* El texto debe ir fuera del contenedor negro de las imágenes para que Bootstrap lo posicione bien */}
                        <div className="carousel-caption d-none d-md-block z-3">
                            <div className="bg-dark bg-opacity-75 rounded-3 px-3 py-2 d-inline-block shadow">
                                <p className="mb-0 fw-semibold text-white">{it.titulo}</p>
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
                        aria-current={i === activeIdx ? "true" : "false"}
                        className={i === activeIdx ? "active" : ""}
                        onClick={() => setIdx(i)}
                    />
                ))}
            </div>
        </div>
    );
}