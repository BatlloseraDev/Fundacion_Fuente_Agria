import { useState, useEffect } from 'react';
import { ComentarioCard } from './ComentarioCard';
import { ModalEdicion } from './ModalEdicion';
import { getComentariosInicio, updateComentarioInicio } from '../services/inicio.service';
import type { ComentarioItem } from '../types/inicio.interface';

interface InicioComentariosProps {
    modoEditor?: boolean;
}

export const InicioComentarios = ({ modoEditor = false }: InicioComentariosProps) => {
    const [comentarios, setComentarios] = useState<ComentarioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [modal, setModal] = useState({
        isOpen: false,
        tituloModal: '',
        valorInicial: '',
        idElemento: '',
        campoBD: ''
    });

    useEffect(() => {
        const fetchComentarios = async () => {
            try {
                setLoading(true);
                const data = await getComentariosInicio();
                setComentarios(data);
            } catch (err) {
                console.error("Error cargando comentarios:", err);
                setError("No se pudieron cargar los comentarios");
            } finally {
                setLoading(false);
            }
        };
        fetchComentarios();
    }, []);

    const abrirModal = (titulo: string, valor: string, idElemento: string, campoBD: string) => {
        setModal({ isOpen: true, tituloModal: titulo, valorInicial: valor, idElemento, campoBD });
    };

    const cerrarModal = () => setModal({ ...modal, isOpen: false });

    const handleGuardar = async (nuevoValor: string) => {
        try {
            await updateComentarioInicio(modal.idElemento, { [modal.campoBD]: nuevoValor });
            
            setComentarios(comentarios.map(com => {
                if (com.id === modal.idElemento) {
                    return { ...com, [modal.campoBD]: nuevoValor };
                }
                return com;
            }));
            
            cerrarModal();
        } catch (err) {
            alert("Hubo un error al guardar los cambios.");
            console.error(err);
        }
    };

    return (
        <section className="py-5">
            <div className="container px-0">
                
                <h2 className="fw-bold mb-4 text-dark">Comentarios</h2>
                
                {loading ? (
                    <div className="text-center py-5 text-secondary">
                        <div className="spinner-border text-primary mb-3" role="status" />
                        <p>Cargando comentarios...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger rounded-4 mt-4 text-center">{error}</div>
                ) : (
                    <div className="row g-4">
                        {comentarios.map((comentario) => (
                            <div className="col-12 col-md-4" key={comentario.id}>
                                <ComentarioCard 
                                    id={comentario.id}
                                    texto={comentario.texto}
                                    etiqueta={comentario.etiqueta}
                                    autor={comentario.autor}
                                    modoEditor={modoEditor}
                                    onEdit={(campoBD, valorActual) => {
                                        const nombreCampo = campoBD === 'texto' ? 'Texto' : campoBD === 'etiqueta' ? 'Etiqueta' : 'Autor';
                                        abrirModal(`Editar ${nombreCampo}`, valorActual, comentario.id, campoBD);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}

            </div>

            <ModalEdicion 
                isOpen={modal.isOpen}
                onClose={cerrarModal}
                onSave={handleGuardar}
                tituloModal={modal.tituloModal}
                valorInicial={modal.valorInicial}
            />
        </section>
    );
};