import type { EncargoPopular } from "../types/encargo.types";

type Props = {
  item: EncargoPopular;
  editMode?: boolean;
  onRemove?: (id: string) => void;

};

export function EncargosPopusCard({ item, editMode, onRemove }: Props) {
  return (
    <div className="card h-100 shadow-sm">
      {editMode && (
        <div className="position-absolute top-0 end-0 m-2 z-3">
          <button className="btn btn-danger btn-sm rounded-circle shadow" onClick={() => onRemove?.(item.id)}>
            <i className="bi bi-trash"></i>
          </button>
        </div>
      )}
      <div
        className="position-relative w-100 bg-dark d-flex justify-content-center align-items-center"
        style={{ height: 170, overflow: "hidden" }}
      >
        {/* 1. Imagen de fondo estirada y desenfocada */}
        <img
          src={item.imagenUrl}
          alt=""
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            objectFit: "cover",
            filter: "blur(15px)", // Un poco menos de blur que en el carrusel porque la imagen es más pequeña
            opacity: 0.5,
            transform: "scale(1.1)"
          }}
        />

        {/* 2. Imagen principal nítida encima */}
        <img
          src={item.imagenUrl}
          className="position-relative h-100 w-100"
          alt={item.nombre}
          style={{
            objectFit: "contain",
            zIndex: 1
          }}
        />
      </div>
      {/* --- FIN DEL CONTENEDOR --- */}
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