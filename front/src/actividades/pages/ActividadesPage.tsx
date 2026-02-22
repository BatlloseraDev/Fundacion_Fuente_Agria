import { useEffect, useState } from 'react';
import { ActividadesHeader } from '../components/ActividadesHeader';
import { ActividadCard } from '../components/ActividadCard';
import { ActividadesPagination } from '../components/ActividadesPagination';
import { actividadesMock } from '../data/actividades.mock';
import type { Actividad } from '../types/actividad.interface';

export const ActividadesPage = () => {
    const [actividades, setActividades] = useState<Actividad[]>([]);

    // useState para la paginación 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    useEffect(() => {
        // Simulo la carga de datos desde el backend
        setActividades(actividadesMock);
    }, []);



    const totalPages = Math.ceil(actividades.length / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const currentActividades = actividades.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        //  scroll suave hacia arriba al cambiar de página aunque no veo que termine de funcionar del todo bien 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <ActividadesHeader />
            <main className="py-5 bg-white">
                <div className="container">

                    {/* Renderizo solo el trozo del array (currentActividades) */}
                    {
                        currentActividades.map((actividad) => (
                            <ActividadCard key={actividad.id} actividad={actividad} />
                        ))
                    }

                    {/* Solo muestro la paginación si hay más de 1 página */}
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