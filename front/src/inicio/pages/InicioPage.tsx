import { InicioHero } from '../components/InicioHero';
import { InicioGrid } from '../components/InicioGrid';
import { InicioNovedades } from '../components/InicioNovedades';

export const InicioPage = () => {
    return (
        <main className="w-100">
            <InicioHero />

            <InicioNovedades />
            
            <InicioGrid />
        </main>
    );
};

export default InicioPage;