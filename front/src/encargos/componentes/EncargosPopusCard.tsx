import type { EncargoPopular } from "../types/encargo.types";

type Props = {
  item: EncargoPopular;
  editMode?: boolean;
  onRemove?: (id: string) => void;

};

export function EncargosPopusCard({ item, editMode, onRemove}: Props) {
  return (
    <div className="card h-100 shadow-sm">
      {editMode && (
        <div className="position-absolute top-0 end-0 m-2 z-3">
          <button className="btn btn-danger btn-sm rounded-circle shadow" onClick={() => onRemove?.(item.id)}>
            <i className="bi bi-trash"></i>
          </button>
        </div>
      )}
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