import { useEffect, useMemo, useState } from "react";
import type { EncargoCarrusel } from "../types/encargo.types";

type Props = {
  items: EncargoCarrusel[];
  autoMs?: number;
};

export function EncargosCarousel({ items, autoMs = 4500 }: Props) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeItems.length, autoMs]);

  if (safeItems.length === 0) return null;

  return (
    <div id="encargosCarousel" className="carousel slide position-relative" aria-label="Carrusel de encargos realizados">
      <div className="carousel-inner rounded-4 overflow-hidden border">
        {safeItems.map((it, i) => (
          <div key={it.id} className={`carousel-item ${i === idx ? "active" : ""}`}>
            <img
              src={it.imagenUrl}
              className="d-block w-100"
              alt={it.alt}
              style={{ height: 320, objectFit: "cover" }}
            />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded-3 px-3 py-2">
              <p className="mb-0 fw-semibold">{it.titulo}</p>
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