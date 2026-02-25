import { GridItem } from './GridItem';
import { mockGridData } from '../data/inicio.mock';

export const InicioGrid = () => {
    return (
        <section className="container py-5 mb-5">
            <div className="text-center mb-5">
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 mb-3">
                    LO MÁS DESTACADO
                </span>
                <h2 className="display-5 fw-bold mb-3">Descubre Nuestras <span className="text-primary">Secciones</span></h2>
            </div>
            
            <div className="row g-4">
                {mockGridData.map((item) => (
                    <div className="col-12 col-md-4" key={item.id}>
                        <GridItem {...item} />
                    </div>
                ))}
            </div>
        </section>
    );
};