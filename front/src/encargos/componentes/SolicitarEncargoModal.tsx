import { useEffect, useMemo, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const MAX_MB = 4;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export function SolicitarEncargoModal({ isOpen, onClose }: Props) {
  // Estados (sin cambios)
  const [titulo, setTitulo] = useState("");
  const [descCorta, setDescCorta] = useState("");
  const [descExtensa, setDescExtensa] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  // Validación básica (sin cambios)
  const canSubmit = useMemo(() => {
    return (
      titulo.trim().length >= 3 &&
      descCorta.trim().length >= 5 &&
      descExtensa.trim().length >= 10
    );
  }, [titulo, descCorta, descExtensa]);

  // Effects y Handlers (sin cambios)
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setTitulo(""); setDescCorta(""); setDescExtensa("");
      setImagen(null); setError(null); setEnviado(false);
    }
  }, [isOpen]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) { setImagen(null); return; }
    if (!f.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen."); e.target.value = ""; setImagen(null); return;
    }
    if (f.size > MAX_BYTES) {
      setError(`La imagen supera los ${MAX_MB}MB. Sube una imagen más pequeña.`); e.target.value = ""; setImagen(null); return;
    }
    setImagen(f);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) { setError("Revisa los campos obligatorios."); return; }
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
      {/* Mantenemos modal-lg para tener espacio para las dos columnas */}
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 rounded-4 shadow-lg" onMouseDown={(e) => e.stopPropagation()}>
          <div className="modal-header border-bottom-0 p-4 pb-0">
            <h5 className="modal-title fw-bold fs-4" id="modalPedidoLabel">Solicitud de Encargo</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar"></button>
          </div>
          
          {/* Aumentamos ligeramente el padding para que respire mejor el diseño de dos columnas */}
          <div className="modal-body p-4 p-md-5">
            {enviado ? (
              <div className="alert alert-success mb-0" role="status">
                Su encargo se procesará a la mayor brevedad posible, gracias.
              </div>
            ) : (
              <div className="row">
                
                {/* --- NUEVA COLUMNA IZQUIERDA (Explicativa) --- */}
                {/* mb-4 añade separación en móvil, pe-lg-5 añade separación en desktop */}
                <div className="col-lg-5 mb-4 mb-lg-0 pe-lg-5 border-end-lg">
                  {/* He ajustado los estilos de tu maqueta para que casen con el diseño actual */}
                  <h2 className="h3 fw-bold mb-3 text-primary">Pedido por encargo</h2>
                  <p className="text-muted small mb-4">
                    Completa el formulario situado a la derecha. Esto es una demostración: no enviará datos reales, pero ilustra el flujo de solicitud.
                  </p>

                  {/* Tarjeta de "Cómo funciona" estilizada */}
                  <div className="card p-4 rounded-3 border-0 bg-light">
                    <div className="fw-bold mb-3">Cómo funciona</div>
                    <ol className="text-muted small mb-0 ps-3">
                      <li className="mb-2">Describe tu pedido y el uso (regalo, evento corporativo, boda, etc).</li>
                      <li className="mb-2">Indica la cantidad aproximada y la fecha límite si la tienes.</li>
                      <li>Nos pondremos en contacto contigo para confirmar detalles con una copía de tu petición para que nos puedas adjuntar archivos y poder enviarte presupuesto.</li>
                    </ol>
                  </div>
                </div>

                {/* --- COLUMNA DERECHA (Formulario existente) --- */}
                <div className="col-lg-7">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="tituloEncargo" className="form-label fw-semibold">Título del Encargo</label>
                      <input 
                        type="text" 
                        className="form-control rounded-3 py-2 bg-light border-0" 
                        id="tituloEncargo"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ej: 50 Detalles para Boda" 
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="descCorta" className="form-label fw-semibold">Descripción Breve</label>
                      <input 
                        type="text" 
                        className="form-control rounded-3 py-2 bg-light border-0" 
                        id="descCorta"
                        value={descCorta}
                        onChange={(e) => setDescCorta(e.target.value)}
                        placeholder="Resumen en una frase de lo que necesitas" 
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="descExtensa" className="form-label fw-semibold">Detalles del Proyecto</label>
                      <textarea 
                        className="form-control rounded-3 py-2 bg-light border-0" 
                        id="descExtensa" 
                        rows={5}
                        value={descExtensa}
                        onChange={(e) => setDescExtensa(e.target.value)}
                        placeholder="Cuéntanos más detalles: materiales, colores, fecha límite, cantidades, etc."
                      ></textarea>
                    </div>


                    <div className="mb-4">
                      <label htmlFor="archivoAdjunto" className="form-label fw-semibold">Archivos de Referencia</label>
   
                      <div className="form-text">
                        {"Los archivos adicionales que nos quieras proporcionar tendrán que ser a traves del correo electrónico autogenerado que recibirar en tu email"}
                      </div>
                    </div>

                    {/* <div className="mb-4">
                      <label htmlFor="archivoAdjunto" className="form-label fw-semibold">Archivos de Referencia (Opcional)</label>
                      <input 
                        className="form-control rounded-3" 
                        type="file" 
                        id="archivoAdjunto" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <div className="form-text">
                        {imagen ? `Seleccionada: ${imagen.name}` : "Puedes adjuntar bocetos o fotos de inspiración (max 4MB)."}
                      </div>
                    </div> */}

                    {error && <div className="alert alert-danger mb-3">{error}</div>}

                    <div className="d-grid mt-4">
                      <button type="submit" className="btn btn-primary btn-lg rounded-pill fw-bold" disabled={!canSubmit}>
                        Enviar Solicitud
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
          
          {!enviado && (
            <div className="modal-footer border-top-0 px-4 pb-4 justify-content-center">
              <small className="text-muted text-center">Al enviar este formulario aceptas nuestra política de privacidad.</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}