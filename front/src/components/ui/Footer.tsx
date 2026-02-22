// src/components/Footer.tsx
import { Link, useNavigate } from 'react-router';

interface FooterProps {
  editorToken: boolean;
  adminToken: boolean;
}


export const Footer = ({ editorToken, adminToken }: FooterProps) => {
  const navigate = useNavigate();
  
  const hasAdminToken = adminToken; 
  const hasEditorToken = editorToken;

  return (
    <footer className="bg-light border-top py-5">
      <div className="container py-4">
        <div className="row g-4">
          
          <div className="col-lg-4">
            <h5 className="fw-bold mb-3 text-primary">Catálogo Fundación Fuente Agria</h5>
            <p className="text-secondary small">
              Fundación Fuente Agria trabaja por la inclusión y el bienestar... (Aquí va la descripción que tiene que ser editable).
            </p>
          </div>
          
          <div className="col-lg-2 offset-lg-1">
            <h6 className="fw-bold mb-3">Explorar</h6>
            <ul className="list-unstyled small text-secondary">
              <li className="mb-2"><Link to="/" className="text-decoration-none text-reset">Inicio</Link></li>
              <li className="mb-2"><Link to="/tienda" className="text-decoration-none text-reset">Tienda</Link></li>
              <li className="mb-2"><Link to="/encargos" className="text-decoration-none text-reset">Encargos</Link></li>
              <li className="mb-2"><Link to="/patrocinadores" className="text-decoration-none text-reset">Patrocinadores</Link></li>
              <li className="mb-2"><Link to="/contacto" className="text-decoration-none text-reset">Contacto</Link></li>
            </ul>
          </div>
          
          <div className="col-lg-2">
            <h6 className="fw-bold mb-3">Legales</h6>
            <ul className="list-unstyled small text-secondary">
              <li className="mb-2"><Link to="/privacidad" className="text-decoration-none text-reset">Privacidad</Link></li>
              <li className="mb-2"><Link to="/cookies" className="text-decoration-none text-reset">Cookies</Link></li>
            </ul>
          </div>
          
          <div className="col-lg-3 text-center text-lg-start">
            {/* Renderizado condicional basado en el token del usuario,
            Esto lo tendremos que editar a futuro pero como mock esta bien*/}
            {hasEditorToken && (
              <button 
                className="btn btn-primary w-100 rounded-pill mb-2 shadow-sm" 
                onClick={() => navigate('/editor')}
              >
                Área editor
              </button>
            )}
            
            {hasAdminToken && (
              <button 
                className="btn btn-outline-secondary w-100 rounded-pill" 
                onClick={() => navigate('/admin')}
              >
                Área administrador
              </button>
            )}
          </div>
          
        </div>
        <hr className="my-5 opacity-10" />
        <div className="text-center text-secondary small">
          &copy; 2026 Fundación Fuente Agria.
        </div>
      </div>
    </footer>
  );
};