import { InicioHero } from '../components/InicioHero';
import { InicioGrid } from '../components/InicioGrid';
import { InicioNovedades } from '../components/InicioNovedades';
import { InicioComentarios } from '../components/InicioComentarios';

export const InicioPage = () => {
    return (
        <main className="w-100">
            <InicioHero />

            <InicioNovedades />
            
            <InicioGrid />

            <InicioComentarios />
        </main>
    );
};

export default InicioPage;