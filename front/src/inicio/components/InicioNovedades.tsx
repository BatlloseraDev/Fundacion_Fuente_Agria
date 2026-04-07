import { useState, useEffect } from 'react';
import { NovedadCard } from './NovedadCard';
import { ModalDiapositiva } from '../../components/ui/ModalDiapositiva';
import type { DatosDiapositiva } from '../../components/ui/ModalDiapositiva';
import { getNovedadesInicio, updateNovedadInicio } from '../services/inicio.service';
import type { NovedadItem } from '../types/inicio.interface';

interface InicioNovedadesProps {
    modoEditor?: boolean;
}

export const InicioNovedades = ({ modoEditor = false }: InicioNovedadesProps) => {
    const [novedades, setNovedades] = useState<NovedadItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [modal, setModal] = useState({
        isOpen: false,
        idElemento: '',
        valoresIniciales: {} as Partial<DatosDiapositiva> & { imagenUrl?: string }
    });

    useEffect(() => {
        const fetchNovedades = async () => {
            try {
                setLoading(true);
                const data = await getNovedadesInicio();
                setNovedades(data);
            } catch (err) {
                console.error("Error cargando novedades:", err);
                setError("No se pudieron cargar las novedades");
            } finally {
                setLoading(false);
            }
        };
        fetchNovedades();
    }, []);

    const abrirModal = (novedad: NovedadItem) => {
        setModal({
            isOpen: true,
            idElemento: novedad.id,
            valoresIniciales: {
                titulo: novedad.titulo,
                descripcion: novedad.descripcion,
                etiqueta: novedad.etiqueta,
                fecha: novedad.fecha,
                enlace: novedad.enlace,
                imagenUrl: novedad.imagenUrl
            }
        });
    };

    const cerrarModal = () => setModal({ ...modal, isOpen: false });

    const handleGuardar = async (datosModificados: DatosDiapositiva) => {
        try {
            let nuevaImagenUrl = modal.valoresIniciales.imagenUrl;

            if (datosModificados.archivoImagen) {
                nuevaImagenUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(datosModificados.archivoImagen!); 
                });
            }

            const datosAActualizar: Partial<NovedadItem> = {
                titulo: datosModificados.titulo,
                descripcion: datosModificados.descripcion,
                etiqueta: datosModificados.etiqueta,
                fecha: datosModificados.fecha,
                enlace: datosModificados.enlace,
                imagenUrl: nuevaImagenUrl, 
            };

            await updateNovedadInicio(modal.idElemento, datosAActualizar);

            setNovedades(novedades.map(nov => 
                nov.id === modal.idElemento ? { ...nov, ...datosAActualizar } : nov
            ));

            cerrarModal();
        } catch (err) {
            alert("Hubo un error al guardar los cambios.");
            console.error(err);
        }
    };

    return (
        <section className="py-5">
            <div className="container px-0">
                <h2 className="fw-bold mb-4">Novedades</h2>
                
                {loading ? (
                    <div className="text-center py-5 text-secondary">
                        <div className="spinner-border text-primary mb-3" role="status" />
                        <p>Cargando novedades...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger rounded-4 mt-4 text-center">{error}</div>
                ) : (
                    <div className="row g-4">
                        {novedades.map((novedad) => (
                            <div className="col-12 col-md-6 col-lg-4" key={novedad.id}>
                                <NovedadCard 
                                    {...novedad}
                                    modoEditor={modoEditor}
                                    onEditClick={() => abrirModal(novedad)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ModalDiapositiva
                isOpen={modal.isOpen}
                onClose={cerrarModal}
                onSave={handleGuardar}
                tituloModal="Editar Novedad"
                tipo="novedades" 
                valoresIniciales={modal.valoresIniciales}
            />
        </section>
    );
};