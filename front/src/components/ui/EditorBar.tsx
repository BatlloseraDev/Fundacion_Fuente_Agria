export const EditorBar = () => {
    return (
        <div className="bg-dark text-white py-2 px-3 shadow-sm w-100" style={{ zIndex: 9999, position: 'sticky', top: 0 }}>
            <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
                <div className="d-flex align-items-center gap-2 small fw-bold">
                    <span className="tracking-wide">MODO EDITOR ACTIVADO</span>
                </div>
                <div className="badge bg-warning text-dark rounded-pill px-3 py-2 fw-medium shadow-sm">
                    Estás editando la página
                </div>
            </div>
        </div>
    );
};