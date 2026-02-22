import { Link } from 'react-router';

export const Header = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm py-3">
      <div className="container">
       
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary" to="/">
          <img src="/imgs/Logo_FFA.png" alt="Logo fundacion fuente agria" style={{ width: '40px' }} />
          <span>Catálogo Fuente Agria</span>
        </Link>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center fw-semibold">
            <li className="nav-item"><Link className="nav-link text-primary" to="/">Inicio</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/tienda">Tienda</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/encargos">Encargos</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/actividades">Actividades</Link></li>
            <li className="nav-item ms-lg-3">
              <Link className="btn btn-primary rounded-pill px-4" to="/login">Iniciar sesión</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};