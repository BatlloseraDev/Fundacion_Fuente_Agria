import { use } from 'react';
import { useNavigate } from 'react-router';
import { EditorContext } from '../../context/editorContext';
import { UserContext } from '../../context/userContext';

export const Footer = () => {
  const navigate = useNavigate();
  
  
  const editorContext = use(EditorContext);
  const { hasRole } = use(UserContext);

  const editMode = editorContext?.editMode ?? false;
  const setEditMode = editorContext?.setEditMode ?? (() => {});

  const isEditor = hasRole(['EDITOR', 'ADMIN']); 
  const isAdmin = hasRole(['ADMIN']);

  return (
    <footer className="border-top bg-white">
      <div className="container py-5">
        <div className="row g-4 justify-content-between">
          
          {/* Columna 1: Logo e info */}
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-3 mb-2">
              <img 
                src="/imgs/Logo_FFA.png" 
                alt="Logo Fundación Fuente Agria (asociación matriz)"
                style={{ height: '56px', width: 'auto' }} 
              />
              <div>
                <div className="fw-semibold">Fundación Fuente Agria</div>
                <div className="text-muted small">Asociación matriz</div>
              </div>
            </div>
            {/* Esta de aqui podría ser editable en el futuro */}
            <p className="text-muted mb-0">
              Encargos de artesanía y servicio de reparación y restauración de muebles de madera.
            </p>
          </div>

          {/* Columna 2: Contacto esta es editable desde admin */}
          <div className="col-lg-3">
            <h3 className="h6 fw-semibold">Contacto (genérico)</h3>
            <ul className="list-unstyled text-muted mb-0">
              <li>📍 Dirección: Calle Ejemplo, 123 · Ciudad Real</li>
              <li>📞 Tel: +34 900 000 000</li>
              <li>✉️ Email: contacto@fundacion-ejemplo.org</li>
              <li>🕒 Horario: L–V 9:00–14:00</li>
              <li style={{ cursor: 'pointer' }} onClick={() => navigate('/videotutoriales')}>🎥 Videotutoriales</li>
            </ul>
          </div>

         
          <div className="col-lg-3">
            <h3 className="h6 fw-semibold">Entidades colaboradoras</h3>
            <div className="d-flex flex-wrap gap-3 align-items-center footer-logos">
              <img src="/imgs/Logo_CCM.png" className="img-fluid" alt="Logo entidad colaboradora: CCM" style={{ maxHeight: '40px' }} />
              <img src="/imgs/Logo_ASPADES.png" className="img-fluid" alt="Logo entidad colaboradora: ASPADES - La Laguna" style={{ maxHeight: '40px' }} />
            </div>
          </div>

          
          {(isEditor || isAdmin) && (
            <div className="col-lg-2">
              <h3 className="h6 fw-semibold">Gestión</h3>
              <div className="d-flex flex-column gap-2 mt-2">
                
                {/* Lógica del Botón de Edición Global */}
                {isEditor && !editMode && (
                  <button 
                    className="btn btn-sm btn-primary w-100 shadow-sm rounded-pill" 
                    onClick={() => setEditMode(true)}
                  >
                    Área editor
                  </button>
                )}

                {/* Si ya está activo, mostramos un badge */}
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


        <div className="d-flex flex-wrap justify-content-between gap-2 text-muted small">
          <span>© <span id="yearNow">{new Date().getFullYear()}</span> Fundación Fuente Agria</span>
          <span>Accesible · Responsive · Bootstrap 5.3</span>
        </div>
      </div>
    </footer>
  );
};