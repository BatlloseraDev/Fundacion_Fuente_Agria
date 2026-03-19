import { GridItem } from './GridItem';
import { mockGridData } from '../data/inicio.mock';

export const InicioGrid = () => {
    return (
        <section className="container py-5 mb-5">
            <div className="text-center mb-5">
                <h2 className="display-5 fw-bold mb-3">Nuestras Áreas de Acción</h2>
                <p className="mb-3">Descubre el trabajo realizado en nuestros talleres y las actividades que compartimos con la comunidad.</p>
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