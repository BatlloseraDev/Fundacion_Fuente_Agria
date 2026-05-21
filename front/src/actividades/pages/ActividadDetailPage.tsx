import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { getActividadById } from '../services/actividades.service';
import type { Actividad } from '../types/actividad.interface';

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const ActividadDetailPage = () => {
  const { id } = useParams();
  const [actividad, setActividad] = useState<Actividad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getActividadById(Number(id))
      .then(setActividad)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" style={{ color: '#1a1f36' }} />
      </div>
    );

  if (error || !actividad)
    return (
      <div className="container py-5 text-center">
        <h2 className="text-muted">{error || 'Actividad no encontrada'}</h2>
        <Link to="/actividades" className="btn btn-outline-secondary rounded-pill mt-3">
          <i className="bi bi-arrow-left me-2"></i>Volver a actividades
        </Link>
      </div>
    );

  const colorClass = actividad.category?.color ?? 'primary';

  return (
    <main className="py-5 bg-white">
      <div className="container" style={{ maxWidth: '780px' }}>

        {/* Navegación */}
        <Link to="/actividades" className="btn btn-outline-secondary rounded-pill mb-4 px-3">
          <i className="bi bi-arrow-left"></i> Volver a actividades
        </Link>

        {/* Categoría */}
        {actividad.category && (
          <div className="mb-3">
            <span className={`badge bg-${colorClass} px-3 py-2 rounded-pill`}>
              {actividad.category.name}
            </span>
          </div>
        )}

        {/* Título y fecha */}
        <h1 className="fw-bold mb-2" style={{ lineHeight: 1.2 }}>{actividad.title}</h1>
        <p className="text-muted mb-4">
          <i className="bi bi-calendar3 me-1"></i> {formatDate(actividad.date)}
        </p>

        {/* Descripción destacada */}
        <p className="lead fw-normal text-dark mb-4" style={{ lineHeight: 1.8 }}>
          {actividad.description}
        </p>

        {/* Imagen de portada */}
        {actividad.coverImage && (
          <img
            src={actividad.coverImage}
            alt={actividad.title}
            className="img-fluid rounded-4 mb-5 w-100 shadow-sm"
            style={{ maxHeight: '480px', objectFit: 'cover' }}
          />
        )}

        {/* Bloques de contenido */}
        <div className="article-body">
          {actividad.blocks.map((block, i) =>
            block.type === 'text' ? (
              <p
                key={i}
                className="text-secondary fs-5"
                style={{ lineHeight: '1.85', whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}
              >
                {block.content}
              </p>
            ) : (
              <figure key={i} className="my-4 text-center">
                <img
                  src={block.content}
                  alt={`Imagen ${i + 1}`}
                  className="img-fluid rounded-4 shadow-sm w-100"
                  style={{ maxHeight: '480px', objectFit: 'cover' }}
                />
              </figure>
            )
          )}
        </div>

      </div>
    </main>
  );
};
