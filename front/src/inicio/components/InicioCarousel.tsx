import { CarouselSlide } from './CarouselSlide';
import { mockCarouselData } from '../data/inicio.mock';

export const InicioCarousel = () => {
    return (
        <div className="carousel slide" id="mi_carousel" data-bs-ride="carousel">
            <div className="carousel-indicators">
                {mockCarouselData.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        data-bs-target="#mi_carousel"
                        data-bs-slide-to={index}
                        className={index === 0 ? 'active' : ''}
                        aria-current={index === 0 ? 'true' : undefined}
                    ></button>
                ))}
            </div>

            <div className="carousel-inner carousel-fade rounded-5 shadow-sm">
                {mockCarouselData.map((slide, index) => (
                    <CarouselSlide key={slide.id} item={slide} estaActivo={index === 0} />
                ))}
            </div>

            <button className="carousel-control-prev" data-bs-target="#mi_carousel" data-bs-slide="prev">
                <span className="carousel-control-prev-icon bg-dark rounded-circle p-3 bg-opacity-50"></span>
            </button>
            <button className="carousel-control-next" data-bs-target="#mi_carousel" data-bs-slide="next">
                <span className="carousel-control-next-icon bg-dark rounded-circle p-3 bg-opacity-50"></span>
            </button>
        </div>
    );
};