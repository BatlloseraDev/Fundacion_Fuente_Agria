interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const ActividadesPagination = ({ currentPage, totalPages, onPageChange }: Props) => {
    // Genero un array con el número de páginas, ej: si totalPages es 3, genera [1, 2, 3]
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <nav aria-label="Navegación de actividades" className="mt-5">
            <ul className="pagination justify-content-center">
                {/* Botón Anterior */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                        className="page-link rounded-start-pill border-0 shadow-sm mx-1" 
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </button>
                </li>

                {/* Números de página dinámicos */}
                {pages.map(page => (
                    <li key={page} className="page-item">
                        <button 
                            className={`page-link border-0 shadow-sm mx-1 rounded-circle ${currentPage === page ? 'bg-primary text-white' : 'text-secondary'}`}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    </li>
                ))}

                {/* Botón Siguiente */}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                        className="page-link rounded-end-pill border-0 shadow-sm mx-1 text-primary" 
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                    </button>
                </li>
            </ul>
        </nav>
    );
};