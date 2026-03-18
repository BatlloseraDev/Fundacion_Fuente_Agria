import { ComentarioCard } from './ComentarioCard';
import { comentariosMock } from '../data/inicio.mock'; 

export const InicioComentarios = () => {
    return (
        <section className="py-5">
            <div className="container px-0">
                
                <h2 className="fw-bold mb-4 text-dark">Comentarios</h2>
                
                <div className="row g-4">
                    {comentariosMock.map((comentario) => (
                        <div className="col-12 col-md-4" key={comentario.id}>
                            <ComentarioCard 
                                id={comentario.id}
                                texto={comentario.texto}
                                etiqueta={comentario.etiqueta}
                                autor={comentario.autor}
                            />
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};