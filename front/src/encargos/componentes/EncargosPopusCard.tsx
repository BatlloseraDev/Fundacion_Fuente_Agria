import type { EncargoPopular } from "../types/encargo.types";

type Props = { item: EncargoPopular };

export function EncargosPopusCard({ item }: Props) {
  return (
    <div className="card h-100 shadow-sm">
      <img
        src={item.imagenUrl}
        className="card-img-top"
        alt={item.nombre}
        style={{ height: 170, objectFit: "cover" }}
      />
      <div className="card-body d-flex flex-column gap-2">
        <h3 className="h6 mb-0">{item.nombre}</h3>

        <div className="small text-secondary">
          <div>
            <span className="fw-semibold text-body">Tiempo estimado:</span>{" de 2 a 14 días "}
            {""}
          </div>
          <div>
            <span className="fw-semibold text-body">Precio:</span>{" "}
            {item.precioTexto}
          </div>
        </div>
      </div>
    </div>
  );
}