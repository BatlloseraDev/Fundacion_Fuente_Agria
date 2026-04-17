import { useEffect, useState } from 'react';
import { ActividadesHeader } from '../components/ActividadesHeader';
import { ActividadCard } from '../components/ActividadCard';
import { ActividadesPagination } from '../components/ActividadesPagination';
import { getActividades } from '../services/actividades.service';
import type { Actividad } from '../types/actividad.interface';

export const ActividadesPage = () => {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    getActividades()
      .then(setActividades)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(actividades.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const currentActividades = actividades.slice(indexOfLast - itemsPerPage, indexOfLast);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <ActividadesHeader />
      <main className="py-5 bg-white">
        <div className="container">
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: '#1a1f36' }} />
            </div>
          )}
          {error && (
            <div className="alert alert-danger rounded-3">{error}</div>
          )}
          {!loading && !error && actividades.length === 0 && (
            <div className="text-center py-5 text-muted">
              No hay actividades publicadas todavía.
            </div>
          )}
          {currentActividades.map((actividad) => (
            <ActividadCard key={actividad.id} actividad={actividad} />
          ))}
          {totalPages > 1 && (
            <ActividadesPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </main>
    </>
  );
};
