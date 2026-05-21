import { useEffect, useRef, useState } from 'react';
import type { Producto } from '../types/producto.interface';
import { uploadArticleImage } from '../services/catalogo.service';

interface Props {
    producto?: Producto;
    onClose: () => void;
    onSave: (data: Partial<Producto>) => void;
}

export default function ProductoEditorModal({ producto, onClose, onSave }: Props) {
    const [form, setForm] = useState<Partial<Producto>>({
        nombre: '',
        descripcion: '',
        descripcionDetallada: '',
        precio: '',
        precioDesde: false,
        stock: 0,
        categoria: '',
        colorCategoria: 'primary',
        imageUrl: '',
        disponible: true,
        etiquetas: [],
    });

    const [etiquetasTexto, setEtiquetasTexto] = useState('');
    const [imagenModo, setImagenModo] = useState<'archivo' | 'url'>('archivo');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageError, setImageError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (producto) {
            setForm(producto);
            setEtiquetasTexto((producto.etiquetas ?? []).join(', '));
            setImagenModo(producto.imageUrl?.includes('/uploads/') ? 'archivo' : 'url');
        } else {
            setForm({
                nombre: '',
                descripcion: '',
                descripcionDetallada: '',
                precio: '',
                precioDesde: false,
                stock: 0,
                categoria: '',
                colorCategoria: 'primary',
                imageUrl: '',
                disponible: true,
                etiquetas: [],
            });
            setEtiquetasTexto('');
            setImagenModo('archivo');
        }
        setImageError('');
    }, [producto]);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'stock' ? { stock: Math.max(0, Number(value) || 0) } : {}),
        }));
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageError('');

        if (!file.type.startsWith('image/')) {
            setImageError('El archivo debe ser una imagen.');
            e.target.value = '';
            return;
        }

        if (file.size > 4 * 1024 * 1024) {
            setImageError('La imagen no puede superar los 4 MB.');
            e.target.value = '';
            return;
        }

        try {
            setUploadingImage(true);
            const imageUrl = await uploadArticleImage(file);
            setForm((prev) => ({ ...prev, imageUrl }));
        } catch (err) {
            setImageError(err instanceof Error ? err.message : 'No se pudo subir la imagen.');
            e.target.value = '';
        } finally {
            setUploadingImage(false);
        }
    }

    function handleEtiquetasChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setEtiquetasTexto(value);

        const etiquetas = value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

        setForm((prev) => ({
            ...prev,
            etiquetas,
        }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSave(form);
        onClose();
    }

    return (
        <>
            <div className="modal show d-block" tabIndex={-1} role="dialog">
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div className="modal-content rounded-4 border-0 shadow">
                        <div className="modal-header border-0 pb-0">
                            <h5 className="modal-title fw-bold">
                                {producto ? 'Editar producto' : 'Nuevo producto'}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Cerrar"
                                onClick={onClose}
                            />
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body pt-3">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Nombre</label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            className="form-control"
                                            value={form.nombre ?? ''}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Precio</label>
                                        <input
                                            type="text"
                                            name="precio"
                                            className="form-control"
                                            value={form.precio ?? ''}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Inventario</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            className="form-control"
                                            min={0}
                                            value={form.stock ?? 0}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-8">
                                        <label className="form-label">Categoria</label>
                                        <input
                                            type="text"
                                            name="categoria"
                                            className="form-control"
                                            value={form.categoria ?? ''}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label">Color categoria</label>
                                        <select
                                            name="colorCategoria"
                                            className="form-select"
                                            value={form.colorCategoria ?? 'primary'}
                                            onChange={handleChange}
                                        >
                                            <option value="primary">primary</option>
                                            <option value="success">success</option>
                                            <option value="warning">warning</option>
                                            <option value="danger">danger</option>
                                            <option value="info">info</option>
                                        </select>
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">Descripcion</label>
                                        <textarea
                                            name="descripcion"
                                            className="form-control"
                                            rows={2}
                                            value={form.descripcion ?? ''}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">Descripcion detallada</label>
                                        <textarea
                                            name="descripcionDetallada"
                                            className="form-control"
                                            rows={4}
                                            value={form.descripcionDetallada ?? ''}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">Imagen</label>
                                        <div className="d-flex gap-2 mb-2">
                                            <button
                                                type="button"
                                                className={`btn btn-sm rounded-pill px-3 ${imagenModo === 'archivo' ? 'btn-dark' : 'btn-outline-secondary'}`}
                                                onClick={() => setImagenModo('archivo')}
                                            >
                                                <i className="bi bi-upload me-1" />Subir archivo
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn btn-sm rounded-pill px-3 ${imagenModo === 'url' ? 'btn-dark' : 'btn-outline-secondary'}`}
                                                onClick={() => setImagenModo('url')}
                                            >
                                                <i className="bi bi-link-45deg me-1" />URL
                                            </button>
                                        </div>

                                        {imagenModo === 'archivo' ? (
                                            <div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="d-none"
                                                    onChange={handleFileChange}
                                                />
                                                <div
                                                    className="rounded-3 d-flex flex-column align-items-center justify-content-center py-3"
                                                    style={{ border: '2px dashed #dee2e6', cursor: 'pointer', minHeight: 90 }}
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    {uploadingImage ? (
                                                        <>
                                                            <div className="spinner-border spinner-border-sm text-primary" role="status" />
                                                            <span className="text-muted small mt-2">Subiendo imagen...</span>
                                                        </>
                                                    ) : form.imageUrl ? (
                                                        <div className="position-relative">
                                                            <img
                                                                src={form.imageUrl}
                                                                alt="Vista previa"
                                                                className="rounded-3 img-fluid"
                                                                style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'cover' }}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle p-0 d-flex align-items-center justify-content-center"
                                                                style={{ width: 24, height: 24, transform: 'translate(40%,-40%)' }}
                                                                onClick={(e) => { e.stopPropagation(); setForm((p) => ({ ...p, imageUrl: '' })); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                            >
                                                                <i className="bi bi-x" style={{ fontSize: 14 }} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-cloud-arrow-up text-muted" style={{ fontSize: '1.8rem' }} />
                                                            <span className="text-muted small mt-1">Haz clic para seleccionar una imagen</span>
                                                        </>
                                                    )}
                                                </div>
                                                {imageError && <div className="text-danger small mt-2">{imageError}</div>}
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                name="imageUrl"
                                                className="form-control"
                                                placeholder="https://..."
                                                value={(!form.imageUrl?.includes('/uploads/') ? form.imageUrl : '') ?? ''}
                                                onChange={handleChange}
                                            />
                                        )}
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">
                                            Etiquetas separadas por comas
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={etiquetasTexto}
                                            onChange={handleEtiquetasChange}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-check mt-2">
                                            <input
                                                type="checkbox"
                                                name="precioDesde"
                                                className="form-check-input"
                                                id="precioDesde"
                                                checked={form.precioDesde ?? false}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="precioDesde">
                                                Mostrar "Desde"
                                            </label>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-check mt-2">
                                            <input
                                                type="checkbox"
                                                name="disponible"
                                                className="form-check-input"
                                                id="disponible"
                                                checked={form.disponible ?? true}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="disponible">
                                                Disponible
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer border-0 pt-0">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary rounded-pill px-4"
                                    onClick={onClose}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary rounded-pill px-4"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="modal-backdrop show"></div>
        </>
    );
}
