import { useEffect, useState } from 'react';
import { CatalogoHeader } from '../components/CatalogoHeader';
import { ProductoCard } from '../components/ProductoCard';
import { ProductoModal } from '../components/ProductoModal';
import { getCatalogo } from '../services/catalogo.service';
import type { Producto } from '../types/producto.interface';

const ITEMS_POR_PAGINA = 8;

export const CatalogoPage = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [visibles, setVisibles] = useState(ITEMS_POR_PAGINA);

    useEffect(() => {
        const cargarCatalogo = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await getCatalogo();
                setProductos(data);
            } catch (err) {
                console.error(err);
                setError('No se pudo cargar el catalogo en este momento.');
            } finally {
                setLoading(false);
            }
        };

        cargarCatalogo();
    }, []);

    useEffect(() => {
        setVisibles(ITEMS_POR_PAGINA);
    }, [searchTerm, categoriaSeleccionada]);

    const categorias = [...new Set(productos.map((p) => p.categoria))];

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
                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <p className="text-secondary mt-3 mb-0">Cargando productos...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="alert alert-danger rounded-4" role="alert">
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            <p className="text-secondary small mb-4">
                                {productosFiltrados.length === 0
                                    ? 'No se encontraron productos.'
                                    : `Mostrando ${productosVisibles.length} de ${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''}`}
                            </p>

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

                                    {hayMas && (
                                        <div className="text-center mt-5">
                                            <p className="text-secondary small mb-3">
                                                {quedan} producto{quedan !== 1 ? 's' : ''} mas
                                            </p>
                                            <button
                                                className="btn btn-outline-primary rounded-pill px-5 py-2 fw-semibold"
                                                onClick={handleVerMas}
                                            >
                                                Ver mas <i className="bi bi-chevron-down ms-1"></i>
                                            </button>
                                        </div>
                                    )}

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
                                        No hay productos que coincidan con tu busqueda.
                                    </p>
                                    <button
                                        className="btn btn-link text-primary mt-2"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setCategoriaSeleccionada('Todas');
                                        }}
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            <ProductoModal
                producto={productoSeleccionado}
                onClose={() => setProductoSeleccionado(null)}
            />
        </>
    );
};