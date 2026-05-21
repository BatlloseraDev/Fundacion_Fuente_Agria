import { Link } from 'react-router';
import { use } from 'react';
import { UserContext } from '../../context/userContext';

export const Header = () => {
  const { isAuthenticated, hasRole, logout } = use(UserContext);

  const isAdmin = hasRole(['ADMIN']);

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top" aria-label="Barra de navegación">
      <div className="container">
        {/* Link al inicio con el formato de la maqueta */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/" aria-label="Ir al inicio">
          <img src="/imgs/Logo_FFA.png" alt="Logo Fundación Fuente Agria (asociación matriz)" style={{ width: '40px' }} />
          <span className="fw-semibold text-dark">Fundación Fuente Agria</span>
        </Link>

        {/* Botón hamburguesa para móvil */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain"
          aria-controls="navMain" aria-expanded="false" aria-label="Abrir menú">
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Enlaces de navegación */}
        <div className="collapse navbar-collapse" id="navMain">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">Inicio</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/catalogo">Catálogo</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/encargos">Encargos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/actividades">Actividades</Link>
            </li>
            {isAdmin && (
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center gap-1" to="/admin">
                  <span>Panel de administrador</span>
                </Link>
              </li>
            )}
          </ul>

          <div className="ms-lg-3 d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <button className="btn btn-sm btn-outline-secondary px-3 rounded-pill" onClick={logout}>
                Cerrar sesión
              </button>
            ) : (
              <Link className="btn btn-sm btn-primary px-3 rounded-pill" to="/login">
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
