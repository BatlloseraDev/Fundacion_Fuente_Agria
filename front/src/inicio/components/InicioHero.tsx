import { InicioCarousel } from './InicioCarousel';

export const InicioHero = () => {
    return (
        <header className="py-5 bg-gradient-light d-flex align-items-center" style={{ minHeight: '70vh' }}>
            <div className="container">
                <div className="row align-items-center g-5">
                    
                    <div className="col-lg-6">
                        <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3">
                            BIENVENIDOS AL CATÁLOGO DE LA FUNDACIÓN
                        </span>
                        <h1 className="display-4 fw-bold mb-4">
                            Construyendo un futuro lleno de <span className="text-primary">posibilidades</span>.
                        </h1>
                        <p className="lead text-secondary mb-5">
                            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ipsam dolor cumque voluptatibus hic
                            distinctio, obcaecati ab ratione vero repellendus. Explicabo quos adipisci eos dolores est.
                        </p>
                        <div className="d-flex gap-3 flex-wrap">
                            <button className="btn btn-primary btn-lg rounded-pill px-5 shadow">Actividades</button>
                            <button className="btn btn-outline-dark btn-lg rounded-pill px-5">Contactar</button>
                        </div>
                    </div>

                    <div className="col-lg-6 p-0 bg-white rounded-5 shadow-lg text-center border">
                        <InicioCarousel />
                    </div>

                </div>
            </div>
        </header>
    );
};