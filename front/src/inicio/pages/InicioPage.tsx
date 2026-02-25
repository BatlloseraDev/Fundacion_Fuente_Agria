import { InicioHero } from '../components/InicioHero';
import { InicioGrid } from '../components/InicioGrid';

export const InicioPage = () => {
    return (
        <main className="w-100">
            <InicioHero />
            
            <InicioGrid />
        </main>
    );
};

export default InicioPage;