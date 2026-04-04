import { useState } from 'react';
import { InicioHero } from '../components/InicioHero';
import { InicioGrid } from '../components/InicioGrid';
import { InicioNovedades } from '../components/InicioNovedades';
import { InicioComentarios } from '../components/InicioComentarios';

export const InicioPage = () => {

    const [modoEditor, setModoEditor] = useState(false);

    return (
        <main className="w-100">
            <InicioHero />

            <InicioNovedades modoEditor={modoEditor} />
            
            <InicioGrid modoEditor={modoEditor} />

            <InicioComentarios />

            <div className="container text-center py-5 mt-5">
                <button 
                    className={`btn ${modoEditor ? 'btn-danger' : 'btn-success'} rounded-pill shadow-sm px-4`}
                    onClick={() => setModoEditor(!modoEditor)}
                >
                    <i className={`bi ${modoEditor ? 'bi-x-circle' : 'bi-pencil'} me-2`}></i>
                    {modoEditor ? 'Desactivar Área Editor' : 'Área Editor'}
                </button>
            </div>

        </main>
    );
};

export default InicioPage;