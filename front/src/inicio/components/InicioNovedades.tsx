import { NovedadCard } from './NovedadCard';
import { novedadesMock } from '../data/inicio.mock'; 

export const InicioNovedades = () => {
    return (
        <section className="py-5">
            <div className="container px-0">
                <h2 className="fw-bold mb-4">Novedades</h2>
                
                <div className="row g-4">
                    {novedadesMock.map((novedad) => (
                        <div className="col-12 col-md-6 col-lg-4" key={novedad.id}>
                            <NovedadCard 
                                id={novedad.id}
                                imagenUrl={novedad.imagenUrl}
                                etiqueta={novedad.etiqueta}
                                fecha={novedad.fecha}
                                titulo={novedad.titulo}
                                descripcion={novedad.descripcion}
                                enlace={novedad.enlace}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};