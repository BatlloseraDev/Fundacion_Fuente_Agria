interface Props {
    onSolicitar: () => void;
}

export function EncargosHeader({ onSolicitar }: Props) {
    return (
        <header className="py-5 bg-gradient-light border-bottom">
            <div className="container text-center py-4">
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 mb-3">
                    TÚ LO IMAGINAS, NOSOTROS LO CREAMOS
                </span>
                <h1 className="display-4 fw-bold mb-3">
                    Encargos <span className="text-primary">Personalizados</span>
                </h1>
                <p className="lead text-secondary mx-auto mb-4" style={{ maxWidth: '700px' }}>
                    ¿Tienes una idea especial? En Fundación Fuente Agria realizamos trabajos a medida para bodas, eventos
                    corporativos o regalos únicos. Cuéntanos tu idea y le daremos forma.
                </p>
                <button 
                    className="btn btn-primary btn-lg rounded-pill px-5 shadow-sm" 
                    onClick={onSolicitar}
                >
                    <i className="bi bi-pencil-square me-2"></i> Solicitar Presupuesto
                </button>
            </div>
        </header>
    );
}