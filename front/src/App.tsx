import { BrowserRouter, Routes, Route } from 'react-router';
import { Header } from './components/ui/Header';
import { Footer } from './components/ui/Footer';
import EncargosPage from "./encargos/pages/EncargosPage";
import './App.css'

// A modo de testeo he puesto esto
const Inicio = () => <div className="container py-5"><h2>Página de Inicio</h2></div>;
const Tienda = () => <div className="container py-5"><h2>Página de Tienda</h2></div>;



function App() {
  return (
    <>
      <BrowserRouter>
        <div className='d-flex flex-column min-vh-100 '>


          <Header /> {/*Esto hace que siempre se renderice el header independientemente de la ruta */}
          <main className="flex-grow-1 container-fluid px-0" style={{ minHeight: '60vh' }}>
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/tienda" element={<Tienda />} />
              <Route path="/encargos" element={<div className="container py-5"><h2>Encargos</h2></div>} />
              <Route path="/actividades" element={<ActividadesPage />} />
              <Route path="/actividades/:id" element={<ActividadDetailPage />} />
              {/* Añadir aquí el resto de las rutas (admin, editor, login, contacto, etc.) */}
            </Routes>
          </main>
          <Footer editorToken={true} adminToken={true} />
          {/*Esto hace que siempre se renderice el footer independientemente de la ruta 
            APUNTE: editor Token y adminToken es lo que se va a encargar de renderizar los botones si tiene permisos, tneemos que investigar la correcta
            integración de esto
          */}
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
