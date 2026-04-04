import { useState, useEffect } from 'react';
import { CarouselSlide } from './CarouselSlide';
import { ModalDiapositiva } from './ModalDiapositiva';
import type { DatosDiapositiva } from './ModalDiapositiva';
import { getCarouselInicio, updateCarouselInicio } from '../services/inicio.service';
import type { CarouselItem } from '../types/inicio.interface';

interface InicioCarouselProps {
    modoEditor?: boolean;
}

export const InicioCarousel = ({ modoEditor = false }: InicioCarouselProps) => {
    const [slides, setSlides] = useState<CarouselItem[]>([]);
    
    const [modal, setModal] = useState({
        isOpen: false,
        idElemento: '',
        valoresIniciales: {} as Partial<DatosDiapositiva> & { imagenUrl?: string }
    });

    useEffect(() => {
        getCarouselInicio()
            .then(data => setSlides(data))
            .catch(err => console.error("Error cargando carrusel:", err));
    }, []);

    const abrirModal = (slide: CarouselItem) => {
        setModal({
            isOpen: true,
            idElemento: slide.id,
            valoresIniciales: {
                titulo: slide.titulo || '',
                descripcion: slide.descripcion || '',
                imagenUrl: slide.imagenUrl
            }
        });
    };

    const handleGuardar = async (datosModificados: DatosDiapositiva) => {
        try {
            let nuevaImagenUrl = modal.valoresIniciales.imagenUrl;

            if (datosModificados.archivoImagen) {
                nuevaImagenUrl = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(datosModificados.archivoImagen!);
                });
            }

            const datosAActualizar: Partial<CarouselItem> = {
                titulo: datosModificados.titulo,
                descripcion: datosModificados.descripcion,
                imagenUrl: nuevaImagenUrl,
            };

            await updateCarouselInicio(modal.idElemento, datosAActualizar);

            setSlides(prev => prev.map(s => 
                s.id === modal.idElemento ? { ...s, ...datosAActualizar } : s
            ));

            setModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
            alert("Error al guardar la diapositiva.");
        }
    };

    if (slides.length === 0) return <div className="p-5 text-center">Cargando carrusel...</div>;

    return (
        <>
            <div className="carousel slide" id="mi_carousel" data-bs-ride="carousel">
                <div className="carousel-indicators">
                    {slides.map((_, index) => (
                        <button 
                            key={index} 
                            type="button" 
                            data-bs-target="#mi_carousel" 
                            data-bs-slide-to={index} 
                            className={index === 0 ? 'active' : ''}
                        />
                    ))}
                </div>

                <div className="carousel-inner carousel-fade rounded-5 shadow-sm">
                    {slides.map((slide, index) => (
                        <CarouselSlide 
                            key={slide.id} 
                            item={slide} 
                            estaActivo={index === 0} 
                            modoEditor={modoEditor}
                            onEditClick={() => abrirModal(slide)}
                        />
                    ))}
                </div>

                <button className="carousel-control-prev" data-bs-target="#mi_carousel" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon bg-dark rounded-circle p-2 bg-opacity-50"></span>
                </button>
                <button className="carousel-control-next" data-bs-target="#mi_carousel" data-bs-slide="next">
                    <span className="carousel-control-next-icon bg-dark rounded-circle p-2 bg-opacity-50"></span>
                </button>
            </div>

            <ModalDiapositiva
                isOpen={modal.isOpen}
                onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
                onSave={handleGuardar}
                tituloModal="Editar Diapositiva"
                tipo="carrusel"
                valoresIniciales={modal.valoresIniciales}
            />
        </>
    );
};