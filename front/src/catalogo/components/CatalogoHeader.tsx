interface Props {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    categoriaSeleccionada: string;
    onCategoriaChange: (value: string) => void;
    categorias: string[];
}

export const CatalogoHeader = ({
    searchTerm,
    onSearchChange,
    categoriaSeleccionada,
    onCategoriaChange,
    categorias
}: Props) => {
    return (
        <div className="bg-white shadow-sm py-4 mb-4">
            <div className="container">
                <div className="row align-items-center g-3">
                    <div className="col-12 col-md-auto">
                        <h1 className="fw-bold text-dark mb-0" style={{ fontSize: '1.75rem' }}>
                            Catálogo de Productos
                        </h1>
                    </div>
                    <div className="col-12 col-md ms-md-auto">
                        <div className="row g-2 justify-content-md-end">
                            <div className="col-12 col-sm-6 col-md-5">
                                <div>
                                    <label className="form-label text-secondary small mb-1">Buscar</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-pill border-light-subtle"
                                        placeholder="Ej: cesta, evento, artesanal..."
                                        value={searchTerm}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-md-4">
                                <div>
                                    <label className="form-label text-secondary small mb-1">Categoría</label>
                                    <select
                                        className="form-select rounded-pill border-light-subtle"
                                        value={categoriaSeleccionada}
                                        onChange={(e) => onCategoriaChange(e.target.value)}
                                    >
                                        <option value="Todas">Todas</option>
                                        {categorias.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
