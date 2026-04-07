import { useContext } from 'react'; // Cambiamos useState por useContext
import { InicioHero } from '../components/InicioHero';
import { InicioGrid } from '../components/InicioGrid';
import { InicioNovedades } from '../components/InicioNovedades';
import { InicioComentarios } from '../components/InicioComentarios';
import { EditorContext } from '../../context/editorContext'; 

export const InicioPage = () => {

    const { modoEditor } = useContext(EditorContext);

    return (
        <main className="w-100">
            
            <InicioHero modoEditor={modoEditor} />

            <InicioNovedades modoEditor={modoEditor} />

            <InicioGrid modoEditor={modoEditor} />

            <InicioComentarios />

        </main>
    );
};

export default InicioPage;