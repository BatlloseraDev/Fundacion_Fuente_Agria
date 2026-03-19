import { useState } from "react";
import { encargosCarruselMock, encargosPopularesMock } from "../data/encargos.mock";
import { EncargosCarousel } from "../componentes/EncargosCarousel";
import { EncargosPopulares } from "../componentes/EncargosPopulares";
import { SolicitarEncargoModal } from "../componentes/SolicitarEncargoModal";
import { EncargosHeader } from "../componentes/EncargosHeader"; // Importamos el nuevo componente

export default function EncargosPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Componente Header*/}
      <EncargosHeader onSolicitar={() => setOpen(true)} />

      {/* Contenido Principal */}
      <main className="container py-5">
        <section className="mb-4" aria-label="Encargos realizados">
          <h2 className="h5 mb-3">Encargos realizados</h2>
          <EncargosCarousel items={encargosCarruselMock} />
        </section>

        <EncargosPopulares items={encargosPopularesMock} />
      </main>

      {/* Modal de solicitud */}
      <SolicitarEncargoModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}