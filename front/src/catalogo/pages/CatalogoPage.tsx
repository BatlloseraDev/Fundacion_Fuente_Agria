import { useEffect, useState } from 'react';
import { CatalogoHeader } from '../components/CatalogoHeader';
import { ProductoCard } from '../components/ProductoCard';
import { ProductoModal } from '../components/ProductoModal';
import { productosMock } from '../data/productos.mock';
import type { Producto } from '../types/producto.interface';

const ITEMS_POR_PAGINA = 8;

export const CatalogoPage = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [visibles, setVisibles] = useState(ITEMS_POR_PAGINA);

    useEffect(() => {
        // Simulamos carga desde backend
        setProductos(productosMock);
    }, []);

    // Al cambiar filtros, resetear cuántos se muestran
    useEffect(() => {
        setVisibles(ITEMS_POR_PAGINA);
    }, [searchTerm, categoriaSeleccionada]);

    // Obtener categorías únicas para el filtro
    const categorias = [...new Set(productos.map((p) => p.categoria))];

    // Filtrado por búsqueda y categoría
    const productosFiltrados = productos.filter((p) => {
        const coincideBusqueda =
            searchTerm === '' ||
            p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.categoria.toLowerCase().includes(searchTerm.toLowerCase());

        const coincideCategoria =
            categoriaSeleccionada === 'Todas' || p.categoria === categoriaSeleccionada;

        return coincideBusqueda && coincideCategoria;
    });

    // Slice de los que se muestran actualmente
    const productosVisibles = productosFiltrados.slice(0, visibles);
    const hayMas = visibles < productosFiltrados.length;
    const quedan = productosFiltrados.length - visibles;

    const handleVerMas = () => {
        setVisibles((prev) => prev + ITEMS_POR_PAGINA);
    };

    return (
        <>
            <CatalogoHeader
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                categoriaSeleccionada={categoriaSeleccionada}
                onCategoriaChange={setCategoriaSeleccionada}
                categorias={categorias}
            />

            <section className="py-4 bg-white">
                <div className="container">

                    {/* Contador de resultados */}
                    <p className="text-secondary small mb-4">
                        {productosFiltrados.length === 0
                            ? 'No se encontraron productos.'
                            : `Mostrando ${productosVisibles.length} de ${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''}`}
                    </p>

                    {/* Grid de productos */}
                    {productosFiltrados.length > 0 ? (
                        <>
                            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
                                {productosVisibles.map((producto) => (
                                    <div className="col" key={producto.id}>
                                        <ProductoCard
                                            producto={producto}
                                            onVerDetalles={setProductoSeleccionado}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Botón Ver más */}
                            {hayMas && (
                                <div className="text-center mt-5">
                                    <p className="text-secondary small mb-3">
                                        {quedan} producto{quedan !== 1 ? 's' : ''} más
                                    </p>
                                    <button
                                        className="btn btn-outline-primary rounded-pill px-5 py-2 fw-semibold"
                                        onClick={handleVerMas}
                                    >
                                        Ver más <i className="bi bi-chevron-down ms-1"></i>
                                    </button>
                                </div>
                            )}

                            {/* Mensaje fin de catálogo */}
                            {!hayMas && productosFiltrados.length > ITEMS_POR_PAGINA && (
                                <div className="text-center mt-5 text-secondary small">
                                    <i className="bi bi-check-circle me-1 text-success"></i>
                                    Has visto todos los productos
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-5">
                            <i className="bi bi-search fs-1 text-secondary opacity-50"></i>
                            <p className="text-secondary mt-3 mb-0">
                                No hay productos que coincidan con tu búsqueda.
                            </p>
                            <button
                                className="btn btn-link text-primary mt-2"
                                onClick={() => { setSearchTerm(''); setCategoriaSeleccionada('Todas'); }}
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Modal de detalle */}
            <ProductoModal
                producto={productoSeleccionado}
                onClose={() => setProductoSeleccionado(null)}
            />
        </>
    );
};
