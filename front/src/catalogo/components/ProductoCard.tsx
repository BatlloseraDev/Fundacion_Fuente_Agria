import type { Producto } from '../types/producto.interface';

interface Props {
    producto: Producto;
    onVerDetalles: (producto: Producto) => void;
}

export const ProductoCard = ({ producto, onVerDetalles }: Props) => {
    const { nombre, descripcion, precio, precioDesde, categoria, colorCategoria, imageUrl, disponible } = producto;

    return (
        <article className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
            {/* Imagen */}
            <div style={{ height: '200px', overflow: 'hidden' }}>
                <img
                    src={imageUrl}
                    alt={nombre}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
            </div>

            {/* Cuerpo */}
            <div className="card-body p-4 d-flex flex-column">
                {/* Categoría + precio */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span
                        className="badge rounded-pill px-3 py-2"
                        style={{
                            backgroundColor: `var(--bs-${colorCategoria}-bg-subtle, #e9ecef)`,
                            color: `var(--bs-${colorCategoria}-text-emphasis, #495057)`,
                            fontSize: '0.75rem'
                        }}
                    >
                        {categoria}
                    </span>
                    <span
                        className="fw-bold rounded-pill px-3 py-1 text-dark"
                        style={{ backgroundColor: '#f8f9fa', fontSize: '0.9rem' }}
                    >
                        {precioDesde ? `Desde ${precio}` : precio}
                    </span>
                </div>

                {/* Nombre */}
                <h3 className="fw-bold mb-2" style={{ fontSize: '1.05rem' }}>{nombre}</h3>

                {/* Descripción */}
                <p className="text-secondary small mb-4 flex-grow-1">{descripcion}</p>

                {/* Botón */}
                <button
                    className={`btn btn-outline-primary rounded-pill w-100 fw-semibold ${!disponible ? 'disabled' : ''}`}
                    onClick={() => onVerDetalles(producto)}
                    disabled={!disponible}
                >
                    Ver detalles
                </button>
            </div>
        </article>
    );
};
