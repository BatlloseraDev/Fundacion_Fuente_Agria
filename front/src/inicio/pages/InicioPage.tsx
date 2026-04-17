import { use, useEffect } from 'react'; // Cambiamos useState por useContext
import { InicioHero } from '../components/InicioHero';
import { InicioGrid } from '../components/InicioGrid';
import { InicioNovedades } from '../components/InicioNovedades';
import { InicioComentarios } from '../components/InicioComentarios';
import { EditorContext } from '../../context/editorContext';

export const InicioPage = () => {

    const editorContext = use(EditorContext);
    const editMode = editorContext?.editMode ?? false;
    const setSaveAction = editorContext?.setSaveAction ?? (() => {});

    useEffect(() => {
        if (editMode) {
            setSaveAction((() => async () => {
                console.log("Cambios de inicio confirmados");
            }) as any);
        } else {
            setSaveAction(null);
        }
        return () => setSaveAction(null);
    }, [editMode, setSaveAction]);

return (
        <main className="w-100">
           
            <InicioHero modoEditor={editMode} />

            <InicioNovedades modoEditor={editMode} />

            <InicioGrid modoEditor={editMode} />

            <InicioComentarios />
        </main>
    );
};

export default InicioPage;