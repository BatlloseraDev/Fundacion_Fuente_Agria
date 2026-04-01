import { useState, useEffect, use } from "react";
import { EncargosCarousel } from "../componentes/EncargosCarousel";
import { EncargosPopulares } from "../componentes/EncargosPopulares";
import { SolicitarEncargoModal } from "../componentes/SolicitarEncargoModal";
import { EncargosHeader } from "../componentes/EncargosHeader"; // Importamos el nuevo componente
import type { EncargoPopular, EncargoCarrusel } from "../types/encargo.types";
import { getEncargosPopulares, getEncargosCarrusel } from "../services/encargos.service";

export default function EncargosPage() {
  const [open, setOpen] = useState(false);
  const [populares, setPopulares] = useState<EncargoPopular[]>([]);
  const [carrusel, setCarrusel] = useState<EncargoCarrusel[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    const fetchPopulares = async () => {
      try {
        setLoading(true);
        const [dataPopulares, dataCarrusel] = await Promise.all([
          getEncargosPopulares(),
          getEncargosCarrusel(),
        ])


        setPopulares(dataPopulares);
        setCarrusel(dataCarrusel);
      } catch (error) {
        console.error("Error en el useEffect, " + error);
        setError("No se pudieron cargar los encargos ");
      } finally {
        setLoading(false);
      }
    };
    fetchPopulares();


  }, []);




  return (
    <>
      {/* Componente Header*/}
      <EncargosHeader onSolicitar={() => setOpen(true)} />

      {/* Contenido Principal */}
      <main className="container py-5">
        {loading ? (
          <div className="text-center py-5 text-secondary">
            <div className="spinner-border text-primary mb-3" role="status" />
            <p>Cargando información de encargos...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger rounded-4 mt-4">{error}</div>
        ) : (
          <>
            {/* Sección del carrusel */}
            {carrusel.length > 0 && (
              <section className="mb-4" aria-label="Encargos realizados">
                <h2 className="h5 mb-3">Encargos realizados</h2>
                <EncargosCarousel items={carrusel} />
              </section>
            )}

            {/* Sección de populares */}
            {populares.length > 0 ? (
              <EncargosPopulares items={populares} />
            ) : (
              <p className="text-muted mt-4">No hay encargos populares configurados actualmente.</p>
            )}
          </>
        )}
      </main>

      {/* Modal de solicitud */}
      <SolicitarEncargoModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}