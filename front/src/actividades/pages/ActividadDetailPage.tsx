import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { actividadesMock } from '../data/actividades.mock';
import type { Actividad } from '../types/actividad.interface';

export const ActividadDetailPage = () => {
    // Obtenemos el ID de la URL usando React Router
    const { id } = useParams();
    const [actividad, setActividad] = useState<Actividad | null>(null);

    useEffect(() => {
        // Busco la actividad correspondiente al ID //obviamente todo es mockeado
        const found = actividadesMock.find(act => act.id === id);
        if (found) {
            setActividad(found);
        }
    }, [id]);

    if (!actividad) return <div className="container py-5 text-center"><h2>Actividad no encontrada</h2></div>;

    return (
        <main className="py-5 bg-white">
            <div className="container" style={{ maxWidth: '800px' }}>
                <Link to="/actividades" className="btn btn-outline-secondary rounded-pill mb-4 p-0 px-3">
                    <i className="bi bi-arrow-left"></i> Volver a actividades
                </Link>
                
                <div className="mb-3">
                    <span className={`badge bg-${actividad.colorClass} px-3 py-2 rounded-pill`}>
                        {actividad.category}
                    </span>
                </div>
                
                <h1 className="fw-bold mb-3">{actividad.title}</h1>
                <p className="text-muted"><i className="bi bi-calendar3"></i> {actividad.date}</p>
                
                <img 
                    src={actividad.imageUrl} 
                    alt={actividad.title} 
                    className="img-fluid rounded-4 my-4 w-100 shadow-sm" 
                    style={{ maxHeight: '450px', objectFit: 'cover' }} 
                />
                
                <div className="fs-5 text-secondary" style={{ lineHeight: '1.8' }}>
                    <p className="lead fw-normal text-dark">{actividad.description}</p>
                    <p>Aquí se cargaría dinámicamente el texto largo del artículo. Esta vista la he dejado preparada para soportar varios párrafos de contenido explicativo sobre el evento, galería de imágenes adicional si se requiere, etc. Todo alineado para una lectura cómoda estilo blog. 
                        Tan solo tendría que implementarlo como en el de arriba</p>
                </div>
            </div>
        </main>
    );
};