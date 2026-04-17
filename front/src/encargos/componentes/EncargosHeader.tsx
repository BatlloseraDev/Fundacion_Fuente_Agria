import { useState, useEffect } from 'react';
import { ComponenteEditable } from '../../components/ui/ComponenteEditable';
import { ModalEdicion } from '../../components/ui/ModalEdicion';
import { getEncargosHeader, updateEncargosHeader, type EncargosHeaderData } from '../services/encargos.service';

interface Props {
    onSolicitar: () => void;
    editMode?: boolean;
}

export function EncargosHeader({ onSolicitar, editMode = false }: Props) {
    const [headerData, setHeaderData] = useState<EncargosHeaderData>({
        badge: "TÚ LO IMAGINAS, NOSOTROS LO CREAMOS",
        badgeStyle: "Normal",
        title: "Encargos Personalizados",
        titleStyle: "Destacado",
        description: "¿Tienes una idea especial? En Fundación Fuente Agria realizamos trabajos a medida para bodas, eventos corporativos o regalos únicos. Cuéntanos tu idea y le daremos forma.",
        descriptionStyle: "Normal"
    });

    // Estado del Modal de edición
    const [modal, setModal] = useState({
        isOpen: false,
        tituloModal: '',
        valorInicial: '',
        estiloInicial: 'Normal',
        campoBD: '' as keyof Omit<EncargosHeaderData, 'badgeStyle' | 'titleStyle' | 'descriptionStyle'>
    });

    // Cargar datos de la BD al montar el componente
    useEffect(() => {
        getEncargosHeader().then(data => {
            if (data && data.title) setHeaderData(data);
        }).catch(console.error);
    }, []);

    const abrirModal = (titulo: string, valor: string, estilo: string, campo: any) => {
        setModal({ isOpen: true, tituloModal: titulo, valorInicial: valor, estiloInicial: estilo, campoBD: campo });
    };

    const cerrarModal = () => setModal({ ...modal, isOpen: false });

    // Guardar los cambios del modal en BD
    const handleGuardar = async (nuevoValor: string, nuevoEstilo: string) => {
        const campoEstilo = `${modal.campoBD}Style` as keyof EncargosHeaderData;
        const newData = {
            ...headerData,
            [modal.campoBD]: nuevoValor,
            [campoEstilo]: nuevoEstilo
        };
        
        try {
            await updateEncargosHeader(newData);
            setHeaderData(newData);
            cerrarModal();
        } catch (e) {
            alert("Error al guardar la configuración de la cabecera.");
        }
    };

    // Interpretar el estilo seleccionado
    const getClaseEstilo = (estilo: string) => {
        if (estilo === 'Cursiva') return 'fst-italic';
        if (estilo === 'Destacado') return 'text-primary';
        return '';
    };

    return (
        <header className="py-5 bg-gradient-light border-bottom position-relative">
            <div className="container text-center py-4">
                
                <div className="d-inline-block mb-3">
                    <ComponenteEditable 
                        modoEditor={editMode} 
                        onEditClick={() => abrirModal('Editar Etiqueta Superior', headerData.badge, headerData.badgeStyle, 'badge')}
                    >
                        <span className={`badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 ${getClaseEstilo(headerData.badgeStyle)}`}>
                            {headerData.badge}
                        </span>
                    </ComponenteEditable>
                </div>

                <div className="mb-3">
                    <ComponenteEditable 
                        modoEditor={editMode} 
                        onEditClick={() => abrirModal('Editar Título', headerData.title, headerData.titleStyle, 'title')}
                    >
                        {/* Se quita el span anidado para que todo el H1 pueda coger el estilo "Destacado" si se selecciona */}
                        <h1 className={`display-4 fw-bold ${getClaseEstilo(headerData.titleStyle)}`}>
                            {headerData.title}
                        </h1>
                    </ComponenteEditable>
                </div>

                <div className="mx-auto mb-4" style={{ maxWidth: '700px' }}>
                    <ComponenteEditable 
                        modoEditor={editMode} 
                        onEditClick={() => abrirModal('Editar Descripción', headerData.description, headerData.descriptionStyle, 'description')}
                    >
                        <p className={`lead text-secondary ${getClaseEstilo(headerData.descriptionStyle)}`}>
                            {headerData.description}
                        </p>
                    </ComponenteEditable>
                </div>

                <button 
                    className="btn btn-primary btn-lg rounded-pill px-5 shadow-sm" 
                    onClick={onSolicitar}
                >
                    <i className="bi bi-pencil-square me-2"></i> Solicitar Presupuesto
                </button>
            </div>

            {/* Inyección del Modal de tu compañero */}
            <ModalEdicion 
                isOpen={modal.isOpen}
                onClose={cerrarModal}
                onSave={handleGuardar}
                tituloModal={modal.tituloModal}
                valorInicial={modal.valorInicial}
                estiloInicial={modal.estiloInicial}
            />
        </header>
    );
}