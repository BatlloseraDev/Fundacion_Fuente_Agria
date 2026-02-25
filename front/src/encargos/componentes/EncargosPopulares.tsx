import type { EncargoPopular } from "../types/encargo.types";
import { EncargosPopusCard } from "./EncargosPopusCard";

type Props = {
  items: EncargoPopular[];
};

export function EncargosPopulares({ items }: Props) {
  return (
    <section aria-label="Encargos populares" className="mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="h5 mb-0">Encargos populares</h2>
      </div>

      <div className="row g-3">
        {items.map((it) => (
          <div key={it.id} className="col-12 col-sm-6 col-lg-3">
            <EncargosPopusCard item={it} />
          </div>
        ))}
      </div>
    </section>
  );
}