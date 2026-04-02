import { useState, useEffect } from 'react';
import { GridItem } from './GridItem';
import { ModalEdicion } from './ModalEdicion';
import { getAreasInicio, updateAreaInicio } from '../services/inicio.service';
import type { GridItem as GridItemType } from '../types/inicio.interface';

interface InicioGridProps {
    modoEditor?: boolean;
}

export const InicioGrid = ({ modoEditor = false }: InicioGridProps) => {
    const [areas, setAreas] = useState<GridItemType[]>([]);
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
        const fetchAreas = async () => {
            try {
                setLoading(true);
                const dataAreas = await getAreasInicio();
                setAreas(dataAreas);
            } catch (err) {
                console.error("Error cargando áreas:", err);
                setError("No se pudieron cargar las áreas de acción");
            } finally {
                setLoading(false);
            }
        };
        fetchAreas();
    }, []);

    const abrirModal = (titulo: string, valor: string, idElemento: string, campoBD: string) => {
        setModal({ isOpen: true, tituloModal: titulo, valorInicial: valor, idElemento, campoBD });
    };

    const cerrarModal = () => setModal({ ...modal, isOpen: false });

    const handleGuardar = async (nuevoValor: string) => {
        try {
            await updateAreaInicio(modal.idElemento, { [modal.campoBD]: nuevoValor });
            
            setAreas(areas.map(area => {
                if (area.id === modal.idElemento) {
                    const claveLocal = modal.campoBD === 'title' ? 'titulo' : 'descripcion';
                    return { ...area, [claveLocal]: nuevoValor };
                }
                return area;
            }));
            
            cerrarModal();
        } catch (err) {
            alert("Hubo un error al guardar los cambios.");
            console.error(err);
        }
    };

    return (
        <section className="container py-5 mb-5">
            <div className="text-center mb-5">
                <h2 className="display-5 fw-bold mb-3">Nuestras Áreas de Acción</h2>

                <p className="mb-3">Descubre el trabajo realizado en nuestros talleres y las actividades que compartimos con la comunidad.</p>
            </div>
            
            {loading ? (
                <div className="text-center py-5 text-secondary">
                    <div className="spinner-border text-primary mb-3" role="status" />
                    <p>Cargando áreas de acción...</p>
                </div>
            ) : error ? (
                <div className="alert alert-danger rounded-4 mt-4 text-center">{error}</div>
            ) : (
                <div className="row g-4">
                    {areas.map((item) => (
                        <div className="col-12 col-md-4" key={item.id}>
                            <GridItem 
                                {...item} 
                                modoEditor={modoEditor} 
                                onEdit={(campoBD, valorActual) => abrirModal(`Editar ${campoBD === 'title' ? 'Título' : 'Descripción'}`, valorActual, item.id, campoBD)}
                            />
                        </div>
                    ))}
                </div>
            )}

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