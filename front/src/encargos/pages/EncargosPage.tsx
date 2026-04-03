import { useState, useEffect, use } from "react";
import { useSearchParams } from "react-router";
import { EncargosCarousel } from "../componentes/EncargosCarousel";
import { EncargosPopulares } from "../componentes/EncargosPopulares";
import { SolicitarEncargoModal } from "../componentes/SolicitarEncargoModal";
import { EncargosHeader } from "../componentes/EncargosHeader";
import { SeleccionarEncargosModal } from "../componentes/SeleccionarEncargosModal";
import type { EncargoPopular, EncargoCarrusel } from "../types/encargo.types";
import { getEncargosPopulares, getEncargosCarrusel, savePageConfig, type BackendOrderData } from "../services/encargos.service";
import { UserContext } from "../../context/userContext";

export default function EncargosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasRole } = use(UserContext);
  
  const isEditorURL = searchParams.get("edit") === "true";
  const editMode = isEditorURL && hasRole(["EDITOR", "ADMIN"]);
  const [open, setOpen] = useState(false);
  const [populares, setPopulares] = useState<EncargoPopular[]>([]);
  const [carrusel, setCarrusel] = useState<EncargoCarrusel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // Guardar en base de datos
  const handleSave = async () => {
    try {
      setSaving(true);
      const idsCarrusel = carrusel.map(c => c.id);
      const idsPopulares = populares.map(p => p.id);
      
      await savePageConfig('orders_carousel', idsCarrusel);
      await savePageConfig('orders_popular', idsPopulares);
      
      alert("¡Cambios guardados con éxito!");
      setSearchParams({}); // Salir del modo edición
    } catch (e) {
      alert("Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {editMode && (
        <div className="bg-dark text-white py-2 px-3 d-flex justify-content-between align-items-center sticky-top" style={{ zIndex: 1040 }}>
            <div>
              <i className="bi bi-pencil-square me-2"></i>
              <small className="fw-bold text-uppercase">Modo Edición Activado</small>
            </div>
            <div>
              <button className="btn btn-sm btn-success rounded-pill px-3 me-2" onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button className="btn btn-sm btn-outline-light rounded-pill px-3" onClick={() => setSearchParams({})}>Salir</button>
            </div>
        </div>
      )}

      <EncargosHeader onSolicitar={() => setOpen(true)} />

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