import { useEffect, useMemo, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const MAX_MB = 4;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export function SolicitarEncargoModal({ isOpen, onClose }: Props) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      nombre.trim().length >= 3 &&
      email.trim().length >= 5 &&
      descripcion.trim().length >= 10
    );
  }, [nombre, email, descripcion]);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setNombre("");
      setEmail("");
      setTelefono("");
      setDescripcion("");
      setImagen(null);
      setError(null);
      setEnviado(false);
    }
  }, [isOpen]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0] ?? null;

    if (!f) {
      setImagen(null);
      return;
    }

    if (!f.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      e.target.value = "";
      setImagen(null);
      return;
    }

    if (f.size > MAX_BYTES) {
      setError(`La imagen supera ${MAX_MB}MB. Sube una imagen mas pequena.`);
      e.target.value = "";
      setImagen(null);
      return;
    }

    setImagen(f);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Revisa los campos obligatorios.");
      return;
    }

    // Aqui normalmente se enviaria al backend/email. Para la practica: simulamos.
    setEnviado(true);
  }

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      style={{ display: "block", background: "rgba(0,0,0,.55)" }}
      onMouseDown={handleBackdropClick}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h5 className="modal-title">Solicitar encargo</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>

          <div className="modal-body">
            {enviado ? (
              <div className="alert alert-success mb-0" role="status">
                Su encargo se procesara a la mayor brevedad posible, gracias.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="nombre">
                      Nombre y apellidos *
                    </label>
                    <input
                      id="nombre"
                      className="form-control"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Ana Perez"
                      autoComplete="name"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="email">
                      Email *
                    </label>
                    <input
                      id="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ej: ana@email.com"
                      autoComplete="email"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="telefono">
                      Telefono
                    </label>
                    <input
                      id="telefono"
                      className="form-control"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej: 600123123"
                      autoComplete="tel"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="imagen">
                      Imagen (max 4MB)
                    </label>
                    <input
                      id="imagen"
                      className="form-control"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <div className="form-text">
                      {imagen ? `Seleccionada: ${imagen.name}` : "Opcional: sube una referencia."}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="form-label" htmlFor="desc">
                    Descripcion *
                  </label>
                  <textarea
                    id="desc"
                    className="form-control"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe el encargo: medidas, colores, texto, material, etc..."
                    rows={5}
                  />
                  <div className="form-text">Minimo recomendado: 10 caracteres.</div>
                </div>

                {error ? <div className="alert alert-danger mb-0">{error}</div> : null}

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
                    Enviar solicitud
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}