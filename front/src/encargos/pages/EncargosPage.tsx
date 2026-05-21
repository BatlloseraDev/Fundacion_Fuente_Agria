import { useState, useEffect, useCallback, use } from "react";
import { EncargosCarousel } from "../componentes/EncargosCarousel";
import { EncargosPopulares } from "../componentes/EncargosPopulares";
import { SolicitarEncargoModal } from "../componentes/SolicitarEncargoModal";
import { EncargosHeader } from "../componentes/EncargosHeader";
import { SeleccionarEncargosModal } from "../componentes/SeleccionarEncargosModal";
import type { EncargoPopular, EncargoCarrusel } from "../types/encargo.types";
import { getEncargosPopulares, getEncargosCarrusel, savePageConfig, type BackendOrderData } from "../services/encargos.service";

// IMPORTAMOS EL CONTEXTO GLOBAL
import { EditorContext } from "../../context/editorContext";

export default function EncargosPage() {
  // Obtenemos el modo edición y la función para pasar nuestra acción de guardado
  const editorContext = use(EditorContext);
  const editMode = editorContext?.editMode ?? false;
  const setSaveAction = editorContext?.setSaveAction ?? (() => {});

  const [open, setOpen] = useState(false);
  const [populares, setPopulares] = useState<EncargoPopular[]>([]);
  const [carrusel, setCarrusel] = useState<EncargoCarrusel[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para modales de añadir
  const [addCarruselModal, setAddCarruselModal] = useState(false);
  const [addPopularesModal, setAddPopularesModal] = useState(false);

  useEffect(() => {
    Promise.all([getEncargosPopulares(), getEncargosCarrusel()])
      .then(([dataPop, dataCar]) => {
        setPopulares(dataPop);
        setCarrusel(dataCar);
      })
      .finally(() => setLoading(false));
  }, []);

  // Funciones para modificar el estado local
  const addAlCarrusel = (item: BackendOrderData) => {
    if (carrusel.find(c => c.id === String(item.id))) return;
    setCarrusel([...carrusel, { id: String(item.id), titulo: item.title, imagenUrl: item.imageAfter || '', alt: item.title }]);
  };

  const addAPopulares = (item: BackendOrderData) => {
    if (populares.find(p => p.id === String(item.id))) return;
    setPopulares([...populares, {
      id: String(item.id), nombre: item.title,
      tiempoEstimado: item.timeInitial ? `${item.timeInitial} a ${item.timeFinal} días` : 'Consultar',
      precioTexto: item.price ? `${item.price} €` : 'Consultar',
      imagenUrl: item.imageAfter || ''
    }]);
  };


  const handleSavePage = useCallback(async () => {
    const idsCarrusel = carrusel.map(c => c.id);
    const idsPopulares = populares.map(p => p.id);
    
    // Las peticiones al backend
    await savePageConfig('orders_carousel', idsCarrusel);
    await savePageConfig('orders_popular', idsPopulares);
  }, [carrusel, populares]);


  useEffect(() => {
    if (editMode) {
      setSaveAction((() => handleSavePage) as any);
    } else {
      setSaveAction(null);
    }
    
    // Limpieza al salir de la página
    return () => setSaveAction(null);
  }, [editMode, handleSavePage, setSaveAction]);

  return (
    <>
      <EncargosHeader onSolicitar={() => setOpen(true)} editMode={editMode} />

      <main className="container py-5 position-relative">
        {loading ? (
           <p className="text-center py-5">Cargando...</p>
        ) : (
          <>
            <section className="mb-5 position-relative">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">Encargos realizados</h2>
                {editMode && (
                  <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => setAddCarruselModal(true)}>
                    + Añadir al Carrusel
                  </button>
                )}
              </div>
              <EncargosCarousel 
                 items={carrusel} 
                 editMode={editMode} 
                 onRemove={(id) => setCarrusel(carrusel.filter(c => c.id !== id))} 
              />
            </section>

            <section className="position-relative">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">Encargos populares</h2>
                {editMode && (
                  <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => setAddPopularesModal(true)}>
                    + Añadir Destacado
                  </button>
                )}
              </div>
              <EncargosPopulares 
                 items={populares} 
                 editMode={editMode} 
                 onRemove={(id) => setPopulares(populares.filter(p => p.id !== id))} 
              />
            </section>
          </>
        )}
      </main>

      <SolicitarEncargoModal isOpen={open} onClose={() => setOpen(false)} />
      
      <SeleccionarEncargosModal isOpen={addCarruselModal} onClose={() => setAddCarruselModal(false)} onSelect={addAlCarrusel} title="Añadir encargo al carrusel" />
      <SeleccionarEncargosModal isOpen={addPopularesModal} onClose={() => setAddPopularesModal(false)} onSelect={addAPopulares} title="Añadir encargo popular" />
    </>
  );
}