import { useEffect, useState } from 'react';
import type { Producto } from '../types/producto.interface';

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
        categoria: '',
        colorCategoria: 'primary',
        imageUrl: '',
        disponible: true,
        etiquetas: [],
    });

    const [etiquetasTexto, setEtiquetasTexto] = useState('');

    useEffect(() => {
        if (producto) {
            setForm(producto);
            setEtiquetasTexto((producto.etiquetas ?? []).join(', '));
        } else {
            setForm({
                nombre: '',
                descripcion: '',
                descripcionDetallada: '',
                precio: '',
                precioDesde: false,
                categoria: '',
                colorCategoria: 'primary',
                imageUrl: '',
                disponible: true,
                etiquetas: [],
            });
            setEtiquetasTexto('');
        }
    }, [producto]);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
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
                                        <label className="form-label">URL de la imagen</label>
                                        <input
                                            type="text"
                                            name="imageUrl"
                                            className="form-control"
                                            value={form.imageUrl ?? ''}
                                            onChange={handleChange}
                                        />
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