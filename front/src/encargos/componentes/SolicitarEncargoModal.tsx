import { use, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../../context/userContext";
import { crearEncargo } from "../services/encargos.service";

type Props = { isOpen: boolean; onClose: () => void };

const MAX_MB = 4;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const STEPS = [
  { icon: "bi-chat-heart", label: "Cuéntanos tu idea" },
  { icon: "bi-image", label: "Añade una referencia" },
  { icon: "bi-telephone-outbound", label: "Te contactamos" },
];

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
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setTitulo(""); setDescripcion(""); setImagen(null);
      setError(null); setEnviado(false); setEnviando(false);
    }
  }, [isOpen]);

  function processFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) { setError("El archivo debe ser una imagen (JPG, PNG, WEBP…)"); return; }
    if (file.size > MAX_BYTES) { setError(`La imagen supera los ${MAX_MB} MB. Elige una más pequeña.`); return; }
    const preview = URL.createObjectURL(file);
    setImagen({ file, preview });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function removeImage() {
    if (imagen) URL.revokeObjectURL(imagen.preview);
    setImagen(null); setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    if (!canSubmit) { setError("Completa el título y la descripción."); return; }
    if (!isAuthenticated || !user) { setError("Debes iniciar sesión para enviar un encargo."); return; }
    setEnviando(true);
    try {
      const imageBefore = imagen ? await fileToBase64(imagen.file) : undefined;
      await crearEncargo({ title: titulo.trim(), text: descripcion.trim(), userId: Number(user.id), imageBefore });
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
      style={{ display: "block", background: "rgba(10,10,20,.65)", backdropFilter: "blur(4px)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: 740 }}>
        <div className="modal-content border-0 overflow-hidden" style={{ borderRadius: 20, boxShadow: "0 24px 80px rgba(0,0,0,.35)" }}
          onMouseDown={(e) => e.stopPropagation()}>

          {/* ── Cabecera con gradiente ── */}
          <div className="position-relative" style={{ background: "linear-gradient(135deg, #1a1f36 0%, #2d3561 100%)", padding: "2rem 2rem 3.5rem" }}>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="position-absolute btn border-0 d-flex align-items-center justify-content-center"
              style={{ top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.15)", color: "#fff", padding: 0 }}
            >
              <i className="bi bi-x" style={{ fontSize: "1.1rem" }} />
            </button>

            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="d-flex align-items-center justify-content-center rounded-3"
                style={{ width: 44, height: 44, background: "rgba(255,255,255,.15)", flexShrink: 0 }}>
                <i className="bi bi-stars" style={{ color: "#fbbf24", fontSize: "1.3rem" }} />
              </div>
              <div>
                <h5 className="text-white fw-bold mb-0" style={{ fontSize: "1.2rem", letterSpacing: "-.01em" }}>
                  Solicitar un encargo
                </h5>
                <p className="mb-0" style={{ color: "rgba(255,255,255,.6)", fontSize: ".82rem" }}>
                  Tú lo imaginas, nosotros lo creamos
                </p>
              </div>
            </div>

            {/* Pasos */}
            <div className="d-flex gap-2 flex-wrap">
              {STEPS.map((s, i) => (
                <div key={i} className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                  style={{ background: "rgba(255,255,255,.1)", fontSize: ".78rem", color: "rgba(255,255,255,.85)" }}>
                  <i className={`bi ${s.icon}`} style={{ fontSize: ".9rem" }} />
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Cuerpo ── */}
          <div style={{ marginTop: "-1.5rem" }}>
            {enviado ? (
              /* Pantalla de éxito */
              <div className="text-center py-5 px-4">
                <div className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 80, height: 80, background: "linear-gradient(135deg, #06d6a0, #0ea5e9)", boxShadow: "0 8px 24px rgba(6,214,160,.35)" }}>
                  <i className="bi bi-check-lg text-white" style={{ fontSize: "2rem" }} />
                </div>
                <h4 className="fw-bold mb-2">¡Encargo recibido!</h4>
                <p className="text-muted mb-4" style={{ maxWidth: 360, margin: "0 auto" }}>
                  Hemos registrado tu solicitud. Nuestro equipo la revisará y se pondrá en contacto contigo en breve con todos los detalles y presupuesto.
                </p>
                <button className="btn btn-dark rounded-pill px-5" onClick={onClose}>Cerrar</button>
              </div>
            ) : (
              <div className="rounded-4 mx-3 mb-3 p-4"
                style={{ background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,.08)" }}>

                {!isAuthenticated && (
                  <div className="d-flex align-items-center gap-3 rounded-3 p-3 mb-4"
                    style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                    <i className="bi bi-exclamation-circle-fill" style={{ color: "#d97706", fontSize: "1.2rem", flexShrink: 0 }} />
                    <div className="small">
                      <span className="fw-semibold" style={{ color: "#92400e" }}>Inicia sesión para continuar</span>
                      <span style={{ color: "#92400e" }}> — necesitas una cuenta para enviar un encargo. </span>
                      <a href="/login" style={{ color: "#b45309", fontWeight: 600 }}>Acceder</a>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">

                  {/* Título */}
                  <div>
                    <label htmlFor="enc-titulo" className="form-label small fw-semibold text-uppercase mb-2"
                      style={{ letterSpacing: ".06em", color: "#6b7280" }}>
                      ¿Qué necesitas?
                    </label>
                    <input
                      id="enc-titulo"
                      type="text"
                      className="form-control border-0 rounded-3 fw-semibold"
                      style={{ background: "#f9fafb", fontSize: "1rem", padding: "0.75rem 1rem" }}
                      placeholder="Ej: 50 detalles de boda personalizados"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      disabled={!isAuthenticated}
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label htmlFor="enc-desc" className="form-label small fw-semibold text-uppercase mb-2"
                      style={{ letterSpacing: ".06em", color: "#6b7280" }}>
                      Cuéntanos los detalles
                    </label>
                    <textarea
                      id="enc-desc"
                      className="form-control border-0 rounded-3"
                      style={{ background: "#f9fafb", resize: "none", padding: "0.75rem 1rem", fontSize: ".93rem" }}
                      rows={4}
                      placeholder="Materiales preferidos, colores, cantidad aproximada, fecha límite, ocasión…"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      disabled={!isAuthenticated}
                    />
                    <div className="d-flex justify-content-end mt-1">
                      <span className="small" style={{ color: descripcion.length < 10 ? "#d1d5db" : "#10b981", transition: "color .2s" }}>
                        {descripcion.length} caracteres{descripcion.length < 10 ? ` (mín. 10)` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Imagen */}
                  <div>
                    <label className="form-label small fw-semibold text-uppercase mb-2 d-flex align-items-center gap-2"
                      style={{ letterSpacing: ".06em", color: "#6b7280" }}>
                      Imagen de referencia
                      <span className="badge rounded-pill fw-normal text-capitalize"
                        style={{ background: "#f3f4f6", color: "#9ca3af", fontSize: ".7rem", letterSpacing: 0 }}>
                        opcional
                      </span>
                    </label>

                    {imagen ? (
                      <div className="rounded-3 overflow-hidden position-relative"
                        style={{ border: "2px solid #e5e7eb", background: "#f9fafb" }}>
                        <img
                          src={imagen.preview}
                          alt="Referencia"
                          style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }}
                        />
                        <div className="position-absolute bottom-0 start-0 end-0 px-3 py-2 d-flex align-items-center justify-content-between"
                          style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)" }}>
                          <span className="text-white small">
                            <i className="bi bi-image me-1" />
                            {imagen.file.name} · {(imagen.file.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                          <button
                            type="button"
                            onClick={removeImage}
                            className="btn btn-sm border-0 d-flex align-items-center gap-1"
                            style={{ background: "rgba(239,68,68,.85)", color: "#fff", borderRadius: 6, padding: "2px 10px", fontSize: ".78rem" }}
                          >
                            <i className="bi bi-trash3" /> Quitar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="rounded-3 d-flex flex-column align-items-center justify-content-center gap-2"
                        style={{
                          border: `2px dashed ${dragging ? "#6366f1" : "#e5e7eb"}`,
                          background: dragging ? "#eef2ff" : "#f9fafb",
                          padding: "2rem 1rem",
                          cursor: isAuthenticated ? "pointer" : "not-allowed",
                          transition: "all .18s",
                        }}
                        onClick={() => isAuthenticated && fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); if (isAuthenticated) setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={isAuthenticated ? handleDrop : undefined}
                      >
                        <div className="d-flex align-items-center justify-content-center rounded-circle mb-1"
                          style={{ width: 48, height: 48, background: dragging ? "#e0e7ff" : "#f3f4f6" }}>
                          <i className="bi bi-cloud-arrow-up" style={{ fontSize: "1.4rem", color: dragging ? "#6366f1" : "#9ca3af" }} />
                        </div>
                        <div className="text-center">
                          <span className="small fw-semibold" style={{ color: isAuthenticated ? (dragging ? "#6366f1" : "#374151") : "#d1d5db" }}>
                            {dragging ? "Suelta la imagen aquí" : "Arrastra una imagen o haz clic para seleccionar"}
                          </span>
                          <div className="small mt-1" style={{ color: "#9ca3af" }}>
                            JPG, PNG, WEBP · máx. {MAX_MB} MB
                          </div>
                        </div>
                      </div>
                    )}

                    <input ref={fileInputRef} type="file" accept="image/*" className="d-none"
                      onChange={handleFileChange} disabled={!isAuthenticated} />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="d-flex align-items-center gap-2 rounded-3 p-3"
                      style={{ background: "#fef2f2", border: "1px solid #fecaca", fontSize: ".88rem", color: "#b91c1c" }}>
                      <i className="bi bi-exclamation-circle-fill flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* Aviso de contacto */}
                  <div className="d-flex gap-3 rounded-3 p-3"
                    style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
                    <i className="bi bi-telephone-outbound-fill flex-shrink-0 mt-1" style={{ color: "#0284c7", fontSize: "1rem" }} />
                    <div style={{ fontSize: ".85rem", color: "#0c4a6e" }}>
                      <span className="fw-semibold">Te contactaremos personalmente</span> una vez revisada tu solicitud para confirmar todos los detalles y enviarte un presupuesto sin compromiso.
                    </div>
                  </div>

                  {/* Botón enviar */}
                  <button
                    type="submit"
                    disabled={!canSubmit || !isAuthenticated || enviando}
                    className="btn fw-bold rounded-pill py-3"
                    style={{
                      background: canSubmit && isAuthenticated
                        ? "linear-gradient(135deg, #1a1f36, #2d3561)"
                        : "#e5e7eb",
                      color: canSubmit && isAuthenticated ? "#fff" : "#9ca3af",
                      fontSize: ".95rem",
                      transition: "all .2s",
                      border: "none",
                    }}
                  >
                    {enviando ? (
                      <><span className="spinner-border spinner-border-sm me-2" />Enviando solicitud…</>
                    ) : (
                      <><i className="bi bi-send me-2" />Enviar solicitud</>
                    )}
                  </button>

                  <p className="text-center mb-0" style={{ fontSize: ".75rem", color: "#9ca3af" }}>
                    Al enviar aceptas nuestra política de privacidad. Tu solicitud no supone ningún compromiso de compra.
                  </p>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
