import { Link } from 'react-router';
import type { Actividad } from '../types/actividad.interface';

interface Props {
  actividad: Actividad;
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const ActividadCard = ({ actividad }: Props) => {
  const { id, title, description, date, category, coverImage } = actividad;
  const colorClass = category?.color ?? 'primary';

  return (
    <article className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
      <div className="row g-0">
        <div className="col-md-5 col-lg-4 position-relative">
          <div
            className={`bg-${colorClass} bg-opacity-10 h-100 d-flex align-items-center justify-content-center`}
            style={{ minHeight: '250px' }}
          >
            {coverImage ? (
              <img
                src={coverImage}
                alt={title}
                className="img-fluid h-100"
                style={{ objectFit: 'cover', width: '100%' }}
              />
            ) : (
              <i
                className={`bi bi-image text-${colorClass}`}
                style={{ fontSize: '3rem', opacity: 0.3 }}
              />
            )}
          </div>
          <div className="position-absolute top-0 start-0 m-3 badge bg-white text-dark shadow-sm rounded-pill px-3 py-2">
            <i className="bi bi-calendar3 me-1"></i> {formatDate(date)}
          </div>
        </div>

        <div className="col-md-7 col-lg-8">
          <div className="card-body p-4 p-lg-5 d-flex flex-column h-100">
            {category && (
              <div className="mb-2">
                <span className={`text-${colorClass} fw-bold text-uppercase small`}>
                  {category.name}
                </span>
              </div>
            )}
            <h2 className="card-title fw-bold h3 mb-3">{title}</h2>
            <p className="card-text text-secondary mb-4">{description}</p>
            <div className="mt-auto">
              <Link
                to={`/actividades/${id}`}
                className={`btn btn-outline-${colorClass} rounded-pill px-4`}
              >
                Leer crónica completa <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
