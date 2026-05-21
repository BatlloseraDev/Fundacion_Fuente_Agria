export const ActividadesHeader = () => {
    return (
        <header className="py-5 bg-gradient-light border-bottom">
            <div className="container text-center py-4">
                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 mb-3">
                    VIDA EN LA FUNDACIÓN
                </span>
                <h1 className="display-4 fw-bold mb-3">Nuestras <span className="text-primary">Actividades</span></h1>
                <p className="lead text-secondary mx-auto mb-4" style={{ maxWidth: '700px' }}>
                    Fomentamos la integración, el aprendizaje y la diversión a través de talleres, excursiones y eventos comunitarios. Descubre lo que hemos estado haciendo.
                </p>
            </div>
        </header>
    );
};