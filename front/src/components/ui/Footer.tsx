import { use, useState } from 'react';
import { useNavigate } from 'react-router';
import { EditorContext } from '../../context/editorContext';
import { UserContext } from '../../context/userContext';

// ── Modales legales ───────────────────────────────────────────────────────────

type LegalType = 'aviso' | 'privacidad' | 'cookies' | null;

const LEGAL_TITLES: Record<Exclude<LegalType, null>, string> = {
  aviso:      'Aviso legal',
  privacidad: 'Política de privacidad',
  cookies:    'Política de cookies',
};

const AvisoLegal = () => (
  <div className="small text-muted" style={{ lineHeight: 1.7 }}>
    <h6 className="fw-bold text-dark">1. Identificación del titular</h6>
    <p>
      En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información
      y de Comercio Electrónico (LSSI-CE), se facilitan los siguientes datos identificativos:
    </p>
    <ul>
      <li><strong>Denominación:</strong> Fundación Fuente Agria</li>
      <li><strong>Tipo de entidad:</strong> Asociación sin ánimo de lucro</li>
      <li><strong>Domicilio social:</strong> Puertollano, Ciudad Real (España)</li>
      <li><strong>Correo electrónico:</strong> contacto@fuenteagria.org</li>
    </ul>

    <h6 className="fw-bold text-dark mt-3">2. Objeto y ámbito de aplicación</h6>
    <p>
      El presente Aviso Legal regula el acceso y uso del sitio web de Fundación Fuente Agria. El
      acceso al sitio implica la aceptación plena y sin reservas de las presentes condiciones.
    </p>

    <h6 className="fw-bold text-dark mt-3">3. Propiedad intelectual e industrial</h6>
    <p>
      Los contenidos del sitio web (textos, imágenes, logotipos, diseño, código fuente, etc.) son
      propiedad de Fundación Fuente Agria o de sus colaboradores, y están protegidos por la
      legislación española e internacional sobre propiedad intelectual. Queda prohibida su
      reproducción, distribución o comunicación pública sin autorización expresa.
    </p>

    <h6 className="fw-bold text-dark mt-3">4. Exclusión de responsabilidad</h6>
    <p>
      Fundación Fuente Agria no se responsabiliza de los daños o perjuicios que pudieran derivarse
      del acceso o uso del sitio web, ni de la interrupción del servicio por causas ajenas a su
      voluntad.
    </p>

    <h6 className="fw-bold text-dark mt-3">5. Legislación aplicable y jurisdicción</h6>
    <p>
      Las presentes condiciones se rigen por la legislación española. Para la resolución de
      cualquier controversia, las partes se someten a los Juzgados y Tribunales de Ciudad Real,
      salvo que la normativa establezca otro fuero imperativo.
    </p>
  </div>
);

const PoliticaPrivacidad = () => (
  <div className="small text-muted" style={{ lineHeight: 1.7 }}>
    <h6 className="fw-bold text-dark">1. Responsable del tratamiento</h6>
    <ul>
      <li><strong>Identidad:</strong> Fundación Fuente Agria</li>
      <li><strong>Domicilio:</strong> Puertollano, Ciudad Real (España)</li>
      <li><strong>Contacto:</strong> contacto@fuenteagria.org</li>
    </ul>

    <h6 className="fw-bold text-dark mt-3">2. Finalidad y base legal</h6>
    <p>Tratamos sus datos personales para las siguientes finalidades:</p>
    <ul>
      <li><strong>Gestión de usuarios registrados</strong> — base legal: ejecución de la relación contractual (art. 6.1.b RGPD).</li>
      <li><strong>Gestión de encargos y reservas</strong> — base legal: ejecución del contrato y obligación legal (art. 6.1.b y 6.1.c RGPD).</li>
      <li><strong>Envío de comunicaciones relacionadas con sus pedidos</strong> — base legal: interés legítimo y ejecución del contrato (art. 6.1.f RGPD).</li>
      <li><strong>Cumplimiento de obligaciones legales</strong> — base legal: obligación legal (art. 6.1.c RGPD).</li>
    </ul>

    <h6 className="fw-bold text-dark mt-3">3. Plazo de conservación</h6>
    <p>
      Los datos se conservarán durante el tiempo necesario para cumplir la finalidad para la que
      fueron recogidos y, en su caso, durante los plazos legalmente exigidos (p. ej., 5 años para
      obligaciones fiscales según la Ley General Tributaria).
    </p>

    <h6 className="fw-bold text-dark mt-3">4. Destinatarios</h6>
    <p>
      No se cederán datos a terceros salvo obligación legal. No realizamos transferencias
      internacionales de datos.
    </p>

    <h6 className="fw-bold text-dark mt-3">5. Derechos de los interesados</h6>
    <p>
      Puede ejercer sus derechos de <strong>acceso, rectificación, supresión, oposición, limitación
      del tratamiento y portabilidad</strong> enviando un escrito a contacto@fuenteagria.org,
      adjuntando copia de su DNI o documento identificativo equivalente.
    </p>
    <p>
      Si considera que el tratamiento no se ajusta a la normativa vigente, puede presentar una
      reclamación ante la <strong>Agencia Española de Protección de Datos</strong> (www.aepd.es).
    </p>

    <h6 className="fw-bold text-dark mt-3">6. Autenticación con Google</h6>
    <p>
      Si opta por autenticarse mediante su cuenta de Google, Google LLC actúa como encargado del
      tratamiento para la verificación de identidad. El tratamiento de sus datos por parte de Google
      se rige por su propia política de privacidad.
    </p>
  </div>
);

const PoliticaCookies = () => (
  <div className="small text-muted" style={{ lineHeight: 1.7 }}>
    <h6 className="fw-bold text-dark">¿Qué son las cookies?</h6>
    <p>
      Las cookies son pequeños archivos de texto que un sitio web almacena en su dispositivo cuando
      lo visita. Permiten que el sitio recuerde sus acciones y preferencias durante un periodo de
      tiempo.
    </p>

    <h6 className="fw-bold text-dark mt-3">Cookies utilizadas en este sitio</h6>
    <table className="table table-sm table-bordered mt-2" style={{ fontSize: '0.8rem' }}>
      <thead style={{ background: '#f0f1f5' }}>
        <tr>
          <th>Nombre</th>
          <th>Tipo</th>
          <th>Finalidad</th>
          <th>Duración</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>jwt_token</code></td>
          <td>Técnica (localStorage)</td>
          <td>Mantiene la sesión del usuario autenticado</td>
          <td>7 días</td>
        </tr>
      </tbody>
    </table>

    <p className="mt-2">
      Este sitio <strong>no utiliza cookies de seguimiento, publicidad ni analítica de terceros</strong>.
      El almacenamiento del token de sesión es estrictamente necesario para el funcionamiento del
      servicio y, conforme al art. 22.2 de la LSSI-CE, no requiere consentimiento previo.
    </p>

    <h6 className="fw-bold text-dark mt-3">Cómo eliminar la sesión</h6>
    <p>
      Puede cerrar sesión en cualquier momento desde el menú de usuario, lo que eliminará el token
      almacenado. También puede borrar el almacenamiento local de su navegador desde la
      configuración de privacidad.
    </p>

    <h6 className="fw-bold text-dark mt-3">Más información</h6>
    <p>
      Para cualquier consulta sobre el uso de cookies puede contactarnos en contacto@fuenteagria.org.
    </p>
  </div>
);

const LegalModal = ({ type, onClose }: { type: Exclude<LegalType, null>; onClose: () => void }) => {
  return (
    <>
      <div
        className="modal-backdrop show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      />
      <div className="modal d-block" style={{ zIndex: 1050 }} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 rounded-4 shadow-lg">
            <div className="modal-header border-0 px-4 pt-4 pb-2">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ width: 38, height: 38, background: '#1a1f36' }}
                >
                  <i className="bi bi-shield-check-fill text-white" style={{ fontSize: '0.9rem' }} />
                </div>
                <h5 className="modal-title fw-bold mb-0">{LEGAL_TITLES[type]}</h5>
              </div>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
            </div>
            <div className="modal-body px-4 py-3">
              {type === 'aviso'      && <AvisoLegal />}
              {type === 'privacidad' && <PoliticaPrivacidad />}
              {type === 'cookies'    && <PoliticaCookies />}
            </div>
            <div className="modal-footer border-0 px-4 pb-4 pt-2">
              <button type="button" className="btn btn-dark rounded-pill px-4" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Footer ────────────────────────────────────────────────────────────────────

export const Footer = () => {
  const navigate = useNavigate();
  const [legalOpen, setLegalOpen] = useState<LegalType>(null);

  const editorContext = use(EditorContext);
  const { hasRole } = use(UserContext);

  const editMode    = editorContext?.editMode    ?? false;
  const setEditMode = editorContext?.setEditMode ?? (() => {});

  const isEditor = hasRole(['EDITOR', 'ADMIN']);
  const isAdmin  = hasRole(['ADMIN']);

  return (
    <>
      <footer className="border-top bg-white">
        <div className="container py-5">
          <div className="row g-4 justify-content-between">

            {/* Columna 1: Logo e info */}
            <div className="col-lg-3">
              <div className="d-flex align-items-center gap-3 mb-2">
                <img
                  src="/imgs/Logo_FFA.png"
                  alt="Logo Fundación Fuente Agria"
                  style={{ height: '56px', width: 'auto' }}
                />
                <div>
                  <div className="fw-semibold">Fundación Fuente Agria</div>
                  <div className="text-muted small">Asociación sin ánimo de lucro</div>
                </div>
              </div>
              <p className="text-muted small mb-0">
                Encargos de artesanía y servicio de reparación y restauración de muebles de madera.
              </p>
            </div>

            {/* Columna 2: Contacto */}
            <div className="col-lg-2">
              <h3 className="h6 fw-semibold">Contacto</h3>
              <ul className="list-unstyled text-muted small mb-0" style={{ lineHeight: 2 }}>
                <li>📍 Puertollano, Ciudad Real</li>
                <li>📞 +34 900 000 000</li>
                <li>✉️ contacto@fuenteagria.org</li>
                <li>🕒 L–V 9:00–14:00</li>
                <li style={{ cursor: 'pointer' }} onClick={() => navigate('/videotutoriales')}>
                  🎥 Videotutoriales
                </li>
              </ul>
            </div>

            {/* Columna 3: Colaboradores */}
            <div className="col-lg-2">
              <h3 className="h6 fw-semibold">Entidades colaboradoras</h3>
              <div className="d-flex flex-wrap gap-3 align-items-center footer-logos mt-2">
                <img src="/imgs/Logo_CCM.png"    className="img-fluid" alt="CCM"    style={{ maxHeight: '40px' }} />
                <img src="/imgs/Logo_ASPADES.png" className="img-fluid" alt="ASPADES" style={{ maxHeight: '40px' }} />
              </div>
            </div>

            {/* Columna 4: Información legal */}
            <div className="col-lg-2">
              <h3 className="h6 fw-semibold">Información legal</h3>
              <ul className="list-unstyled small mb-0" style={{ lineHeight: 2.2 }}>
                <li>
                  <button
                    className="btn btn-link p-0 text-muted text-decoration-none"
                    style={{ fontSize: '0.875rem' }}
                    onClick={() => setLegalOpen('aviso')}
                  >
                    Aviso legal
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-link p-0 text-muted text-decoration-none"
                    style={{ fontSize: '0.875rem' }}
                    onClick={() => setLegalOpen('privacidad')}
                  >
                    Política de privacidad
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-link p-0 text-muted text-decoration-none"
                    style={{ fontSize: '0.875rem' }}
                    onClick={() => setLegalOpen('cookies')}
                  >
                    Política de cookies
                  </button>
                </li>
              </ul>
            </div>

            {/* Columna 5: Gestión (solo editores/admins) */}
            {(isEditor || isAdmin) && (
              <div className="col-lg-2">
                <h3 className="h6 fw-semibold">Gestión</h3>
                <div className="d-flex flex-column gap-2 mt-2">
                  {isEditor && !editMode && (
                    <button
                      className="btn btn-sm btn-primary w-100 shadow-sm rounded-pill"
                      onClick={() => setEditMode(true)}
                    >
                      Área editor
                    </button>
                  )}
                  {isEditor && editMode && (
                    <span className="badge bg-success w-100 py-2 rounded-pill shadow-sm">
                      Modo Edición Activo
                    </span>
                  )}
                  {isAdmin && (
                    <button
                      className="btn btn-sm btn-outline-secondary w-100 rounded-pill"
                      onClick={() => navigate('/admin')}
                    >
                      Área administrador
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <hr className="my-4" />

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 text-muted small">
            <span>© {new Date().getFullYear()} Fundación Fuente Agria · Todos los derechos reservados</span>
            <div className="d-flex gap-3">
              <button
                className="btn btn-link p-0 text-muted text-decoration-none small"
                onClick={() => setLegalOpen('aviso')}
              >
                Aviso legal
              </button>
              <button
                className="btn btn-link p-0 text-muted text-decoration-none small"
                onClick={() => setLegalOpen('privacidad')}
              >
                Privacidad
              </button>
              <button
                className="btn btn-link p-0 text-muted text-decoration-none small"
                onClick={() => setLegalOpen('cookies')}
              >
                Cookies
              </button>
            </div>
          </div>
        </div>
      </footer>

      {legalOpen && (
        <LegalModal type={legalOpen} onClose={() => setLegalOpen(null)} />
      )}
    </>
  );
};
