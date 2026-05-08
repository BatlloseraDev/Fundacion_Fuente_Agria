import { use, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../../context/userContext";
import { crearEncargo } from "../services/encargos.service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const MAX_MB = 4;
const MAX_BYTES = MAX_MB * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function SolicitarEncargoModal({ isOpen, onClose }: Props) {
  const { user, isAuthenticated } = use(UserContext);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState<{ file: File; preview: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = useMemo(
    () => titulo.trim().length >= 3 && descripcion.trim().length >= 10,
    [titulo, descripcion],
  );

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
      setTitulo("");
      setDescripcion("");
      setImagen(null);
      setError(null);
      setEnviado(false);
      setEnviando(false);
    }
  }, [isOpen]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function processFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen (JPG, PNG, WEBP…)");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`La imagen supera los ${MAX_MB} MB. Elige una más pequeña.`);
      return;
    }
    const preview = URL.createObjectURL(file);
    setImagen({ file, preview });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function removeImage() {
    if (imagen) URL.revokeObjectURL(imagen.preview);
    setImagen(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError("Revisa los campos obligatorios.");
      return;
    }
    if (!isAuthenticated || !user) {
      setError("Debes iniciar sesión para enviar un encargo.");
      return;
    }
    setEnviando(true);
    try {
      let imageBefore: string | undefined;
      if (imagen) {
        imageBefore = await fileToBase64(imagen.file);
      }
      await crearEncargo({
        title: titulo.trim(),
        text: descripcion.trim(),
        userId: Number(user.id),
        imageBefore,
      });
      setEnviado(true);
    } catch {
      setError("No se pudo enviar el encargo. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
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
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div
          className="modal-content border-0 rounded-4 shadow-lg"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="modal-header border-bottom-0 p-4 pb-0">
            <h5 className="modal-title fw-bold fs-4">Solicitud de Encargo</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
          </div>

          <div className="modal-body p-4 p-md-5">
            {enviado ? (
              <div className="text-center py-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                  style={{ width: 64, height: 64, background: "#d4f5e9", fontSize: "2rem" }}
                >
                  <i className="bi bi-check-lg" style={{ color: "#0a6640" }} />
                </div>
                <h6 className="fw-bold mb-2">¡Encargo enviado!</h6>
                <p className="text-muted small mb-0">
                  Hemos recibido tu solicitud. Nos pondremos en contacto contigo a la mayor brevedad posible.
                </p>
              </div>
            ) : (
              <div className="row">
                {/* Columna explicativa */}
                <div className="col-lg-5 mb-4 mb-lg-0 pe-lg-5">
                  <h2 className="h3 fw-bold mb-3 text-primary">Pedido por encargo</h2>
                  <p className="text-muted small mb-4">
                    Cuéntanos tu idea y nuestro equipo la valorará personalmente.
                  </p>
                  <div className="card p-4 rounded-3 border-0 bg-light">
                    <div className="fw-bold mb-3">Cómo funciona</div>
                    <ol className="text-muted small mb-0 ps-3">
                      <li className="mb-2">Describe tu pedido y el uso (regalo, evento, boda…).</li>
                      <li className="mb-2">Adjunta una imagen de referencia si la tienes.</li>
                      <li>Te contactaremos para confirmar detalles y enviarte presupuesto.</li>
                    </ol>
                  </div>
                </div>

                {/* Formulario */}
                <div className="col-lg-7">
                  <form onSubmit={handleSubmit}>
                    {!isAuthenticated && (
                      <div className="alert alert-warning border-0 rounded-3 small mb-3">
                        <i className="bi bi-exclamation-triangle-fill me-2" />
                        Debes{" "}
                        <a href="/login" className="alert-link">iniciar sesión</a>{" "}
                        para enviar un encargo.
                      </div>
                    )}

                    <div className="mb-3">
                      <label htmlFor="tituloEncargo" className="form-label fw-semibold">
                        Título del encargo
                      </label>
                      <input
                        type="text"
                        className="form-control rounded-3 py-2 bg-light border-0"
                        id="tituloEncargo"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ej: 50 Detalles para Boda"
                        disabled={!isAuthenticated}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="descEncargo" className="form-label fw-semibold">
                        Descripción del proyecto
                      </label>
                      <textarea
                        className="form-control rounded-3 py-2 bg-light border-0"
                        id="descEncargo"
                        rows={4}
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Materiales, colores, fecha límite, cantidades…"
                        disabled={!isAuthenticated}
                      />
                    </div>

                    {/* Zona de imagen */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Imagen de referencia{" "}
                        <span className="text-muted fw-normal">(opcional)</span>
                      </label>

                      {imagen ? (
                        <div className="position-relative d-inline-block">
                          <img
                            src={imagen.preview}
                            alt="Previsualización"
                            className="rounded-3 border"
                            style={{ maxHeight: 160, maxWidth: "100%", objectFit: "cover", display: "block" }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: 26, height: 26, margin: "6px", padding: 0, fontSize: "0.75rem" }}
                            onClick={removeImage}
                            title="Quitar imagen"
                          >
                            <i className="bi bi-x" />
                          </button>
                          <div className="text-muted small mt-1">
                            {imagen.file.name} · {(imagen.file.size / 1024 / 1024).toFixed(1)} MB
                          </div>
                        </div>
                      ) : (
                        <div
                          className="rounded-3 d-flex flex-column align-items-center justify-content-center gap-2 py-4 px-3"
                          style={{
                            border: `2px dashed ${dragging ? "#0d6efd" : "#dee2e6"}`,
                            background: dragging ? "#f0f5ff" : "#f8f9fa",
                            cursor: isAuthenticated ? "pointer" : "default",
                            transition: "all .15s",
                          }}
                          onClick={() => isAuthenticated && fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); if (isAuthenticated) setDragging(true); }}
                          onDragLeave={() => setDragging(false)}
                          onDrop={isAuthenticated ? handleDrop : undefined}
                        >
                          <i className="bi bi-image text-muted" style={{ fontSize: "1.75rem" }} />
                          <div className="text-center">
                            <span className="small fw-semibold" style={{ color: isAuthenticated ? "#0d6efd" : "#adb5bd" }}>
                              Haz clic o arrastra una imagen
                            </span>
                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                              JPG, PNG, WEBP · máx. {MAX_MB} MB
                            </div>
                          </div>
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={handleFileChange}
                        disabled={!isAuthenticated}
                      />
                    </div>

                    {error && (
                      <div className="alert alert-danger border-0 rounded-3 small mb-3">
                        {error}
                      </div>
                    )}

                    <div className="d-grid mt-2">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg rounded-pill fw-bold"
                        disabled={!canSubmit || !isAuthenticated || enviando}
                      >
                        {enviando ? (
                          <><span className="spinner-border spinner-border-sm me-2" />Enviando…</>
                        ) : (
                          "Enviar Solicitud"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          {!enviado && (
            <div className="modal-footer border-top-0 px-4 pb-4 justify-content-center">
              <small className="text-muted text-center">
                Al enviar este formulario aceptas nuestra política de privacidad.
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
