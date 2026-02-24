import type { CarouselItem } from '../types/inicio.interface';

interface Props {
    item: CarouselItem;
    estaActivo: boolean;
}

export const CarouselSlide = ({ item, estaActivo }: Props) => {
    return (
        <div className={`carousel-item ${estaActivo ? 'active' : ''}`} data-bs-interval="3000">
            <img 
                src={item.imagenUrl} 
                className="d-block w-100 rounded-5" 
                alt={item.titulo || 'Imagen carrusel'} 
                style={{ objectFit: 'cover', height: '400px' }} 
            />
            
            {item.titulo && (
                <div className="carousel-caption d-none d-md-block bg-white bg-opacity-75 rounded-3 text-dark mb-3 mx-4 p-3 shadow-sm">
                    <h3 className="fw-bold mb-1">{item.titulo}</h3>
                    {item.descripcion && <p className="mb-0">{item.descripcion}</p>}
                </div>
            )}
        </div>
    );
};