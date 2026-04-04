import { useState, useEffect } from 'react';
import { InicioCarousel } from './InicioCarousel';
import { ComponenteEditable } from './ComponenteEditable';
import { ModalEdicion } from './ModalEdicion';
import { getHeroInicio, updateHeroInicio } from '../services/inicio.service';
import type { HeroItem } from '../types/inicio.interface';

interface InicioHeroProps {
    modoEditor?: boolean;
}

export const InicioHero = ({ modoEditor = false }: InicioHeroProps) => {
    const [hero, setHero] = useState<HeroItem>({
        badge: '',
        titulo: '',
        descripcion: ''
    });

    const [modal, setModal] = useState({
        isOpen: false,
        tituloModal: '',
        valorInicial: '',
        estiloInicial: 'Normal',
        campoBD: ''
    });

    useEffect(() => {
        const fetchHero = async () => {
            try {
                const heroData = await getHeroInicio();
                if (heroData && heroData.titulo) {
                    setHero(heroData);
                }
            } catch (err) {
                console.error("Error cargando el Hero:", err);
            }
        };
        fetchHero();
    }, []);

    const abrirModal = (campoBD: string, valor: string, estilo: string = 'Normal', tituloModal: string) => {
        setModal({ isOpen: true, tituloModal, valorInicial: valor, estiloInicial: estilo, campoBD });
    };

    const cerrarModal = () => setModal({ ...modal, isOpen: false });

    const handleGuardar = async (nuevoValor: string, nuevoEstilo: string) => {
        try {
            const campoEstilo = modal.campoBD + 'Style';
            
            await updateHeroInicio({ 
                [modal.campoBD]: nuevoValor,
                [campoEstilo]: nuevoEstilo
            });
            
            setHero(prev => ({
                ...prev,
                [modal.campoBD]: nuevoValor,
                [campoEstilo]: nuevoEstilo
            }));
            
            cerrarModal();
        } catch (err) {
            alert("Hubo un error al guardar los cambios del Hero.");
            console.error(err);
        }
    };

    const getClaseEstilo = (estilo?: string) => {
        if (estilo === 'Cursiva') return 'fst-italic';
        if (estilo === 'Destacado') return 'text-primary';
        return '';
    };

    return (
        <header className="py-5 bg-gradient-light d-flex align-items-center" style={{ minHeight: '70vh' }}>
            <div className="container">
                <div className="row align-items-center g-5">
                    
                    <div className="col-lg-6">
                        
                        <ComponenteEditable modoEditor={modoEditor} tipo="texto" onEditClick={() => abrirModal('badge', hero.badge, hero.badgeStyle, 'Editar Etiqueta')}>
                            <span className={`badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3 ${getClaseEstilo(hero.badgeStyle)}`}>
                                {hero.badge || 'Cargando...'}
                            </span>
                        </ComponenteEditable>

                        <ComponenteEditable modoEditor={modoEditor} tipo="texto" onEditClick={() => abrirModal('titulo', hero.titulo, hero.tituloStyle, 'Editar Título')}>
                            <h1 className={`display-4 fw-bold mb-4 ${getClaseEstilo(hero.tituloStyle)}`}>
                                {hero.titulo || 'Cargando...'}
                            </h1>
                        </ComponenteEditable>

                        <ComponenteEditable modoEditor={modoEditor} tipo="texto" onEditClick={() => abrirModal('descripcion', hero.descripcion, hero.descripcionStyle, 'Editar Descripción')}>
                            <p className={`lead text-secondary mb-5 ${getClaseEstilo(hero.descripcionStyle)}`}>
                                {hero.descripcion || 'Cargando...'}
                            </p>
                        </ComponenteEditable>

                    </div>

                    <div className="col-lg-6 p-0 bg-white rounded-5 shadow-lg text-center border">
                        <InicioCarousel />
                    </div>

                </div>
            </div>

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
};