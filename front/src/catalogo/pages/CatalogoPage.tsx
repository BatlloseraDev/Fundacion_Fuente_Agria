import { useEffect, useMemo, useRef, useState, use } from 'react';
import { CatalogoHeader } from '../components/CatalogoHeader';
import { ProductoCard } from '../components/ProductoCard';
import { ProductoModal } from '../components/ProductoModal';
import ProductoEditorModal from '../components/ProductoEditorModal';
import {
    fetchCatalogo,
    createProducto,
    updateProducto,
    deleteProducto,
} from '../services/catalogo.service';
import type { Producto } from '../types/producto.interface';
import { EditorContext } from '../../context/editorContext';

const ITEMS_POR_PAGINA = 8;

export function CatalogoPage() {
    const editorContext = use(EditorContext);

    const isEditor = editorContext?.editMode ?? false;
    const setSaveAction = editorContext?.setSaveAction;

    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
    const [modalEditorAbierto, setModalEditorAbierto] = useState(false);
    const [visibles, setVisibles] = useState(ITEMS_POR_PAGINA);

    const [idsEliminados, setIdsEliminados] = useState<string[]>([]);
    const [idsModificados, setIdsModificados] = useState<string[]>([]);

    const guardandoRef = useRef(false);

    useEffect(() => {
        const cargarCatalogo = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await fetchCatalogo();
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

    const categorias = useMemo(
        () => [...new Set(productos.map((p) => p.categoria).filter(Boolean))],
        [productos]
    );

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

    const abrirNuevoProducto = () => {
        setProductoEditando(null);
        setModalEditorAbierto(true);
    };

    const abrirEditarProducto = (producto: Producto) => {
        setProductoEditando(producto);
        setModalEditorAbierto(true);
    };

    const eliminarProductoLocal = (id: string) => {
        if (!id.startsWith('temp-')) {
            setIdsEliminados((prev) => [...new Set([...prev, id])]);
            setIdsModificados((prev) => prev.filter((item) => item !== id));
        }

        setProductos((prev) => prev.filter((producto) => producto.id !== id));

        if (productoSeleccionado?.id === id) {
            setProductoSeleccionado(null);
        }
    };

    const guardarProductoEnLocal = (data: Partial<Producto>) => {
        if (productoEditando) {
            setProductos((prev) =>
                prev.map((producto) =>
                    producto.id === productoEditando.id
                        ? {
                              ...producto,
                              ...data,
                              id: producto.id,
                          }
                        : producto
                )
            );

            if (!productoEditando.id.startsWith('temp-')) {
                setIdsModificados((prev) => [...new Set([...prev, productoEditando.id])]);
            }

            return;
        }

        const nuevoProducto: Producto = {
            id: `temp-${Date.now()}`,
            nombre: data.nombre ?? '',
            descripcion: data.descripcion ?? '',
            descripcionDetallada: data.descripcionDetallada ?? '',
            precio: data.precio ?? '',
            precioDesde: data.precioDesde ?? false,
            categoria: data.categoria ?? '',
            colorCategoria: data.colorCategoria ?? 'primary',
            imageUrl: data.imageUrl ?? '',
            disponible: data.disponible ?? true,
            etiquetas: data.etiquetas ?? [],
        };

        setProductos((prev) => [nuevoProducto, ...prev]);
    };

    useEffect(() => {
        if (!setSaveAction) return;

        setSaveAction(async () => {
            if (guardandoRef.current) {
                return;
            }

            guardandoRef.current = true;

            try {
                const productosNuevos = productos.filter((producto) =>
                    producto.id.startsWith('temp-')
                );

                const productosModificados = productos.filter(
                    (producto) =>
                        !producto.id.startsWith('temp-') &&
                        idsModificados.includes(producto.id) &&
                        !idsEliminados.includes(producto.id)
                );

                const hayCambios =
                    idsEliminados.length > 0 ||
                    productosNuevos.length > 0 ||
                    productosModificados.length > 0;

                if (!hayCambios) {
                    return;
                }

                for (const id of idsEliminados) {
                    await deleteProducto(id);
                }

                for (const producto of productosNuevos) {
                    await createProducto(producto);
                }

                for (const producto of productosModificados) {
                    await updateProducto(producto.id, producto);
                }

                const data = await fetchCatalogo();
                setProductos(data);
                setIdsEliminados([]);
                setIdsModificados([]);
            } catch (err) {
                console.error(err);
                throw err;
            } finally {
                guardandoRef.current = false;
            }
        });

        return () => {
            setSaveAction(null);
        };
    }, [productos, idsEliminados, idsModificados, setSaveAction]);

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
                    {isEditor && (
                        <div className="d-flex justify-content-end mb-4">
                            <button
                                className="btn btn-primary rounded-pill px-4 py-2 fw-semibold"
                                onClick={abrirNuevoProducto}
                            >
                                <i className="bi bi-plus-lg me-2"></i>
                                Anadir producto
                            </button>
                        </div>
                    )}

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
                                                <div className="h-100 d-flex flex-column">
                                                    <ProductoCard
                                                        producto={producto}
                                                        onVerDetalles={setProductoSeleccionado}
                                                    />

                                                    {isEditor && (
                                                        <div className="d-flex gap-2 mt-3">
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-primary btn-sm flex-fill rounded-pill"
                                                                onClick={() =>
                                                                    abrirEditarProducto(producto)
                                                                }
                                                            >
                                                                <i className="bi bi-pencil-square me-1"></i>
                                                                Editar
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger btn-sm flex-fill rounded-pill"
                                                                onClick={() =>
                                                                    eliminarProductoLocal(producto.id)
                                                                }
                                                            >
                                                                <i className="bi bi-trash me-1"></i>
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
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

            {modalEditorAbierto && (
                <ProductoEditorModal
                    producto={productoEditando ?? undefined}
                    onClose={() => {
                        setModalEditorAbierto(false);
                        setProductoEditando(null);
                    }}
                    onSave={guardarProductoEnLocal}
                />
            )}
        </>
    );
}