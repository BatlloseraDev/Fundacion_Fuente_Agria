import { useState } from "react";
import { encargosCarruselMock, encargosPopularesMock } from "../data/encargos.mock";
import { EncargosCarousel } from "../componentes/EncargosCarousel";
import { EncargosPopulares } from "../componentes/EncargosPopulares";
import { SolicitarEncargoModal } from "../componentes/SolicitarEncargoModal";

export default function EncargosPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="container py-5">
      <div className="d-flex flex-column gap-2 mb-4">
        <h1 className="h3 mb-0">Encargos personalizados</h1>

        <div className="mt-3">
          <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
            Solicitar encargo
          </button>
        </div>
      </div>

      <section className="mb-4" aria-label="Encargos realizados">
        <h2 className="h5 mb-3">Encargos realizados</h2>
        <EncargosCarousel items={encargosCarruselMock} />
      </section>

      <EncargosPopulares items={encargosPopularesMock} />

      <SolicitarEncargoModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}