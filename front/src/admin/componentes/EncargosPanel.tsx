import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { AdminOrder, OrderStatus } from '../types/admin.types';
import { getOrders, updateOrder } from '../services/admin.service';

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface EditForm {
  price: string;
  imageAfter: string;       // base64 o URL ya guardada
  imageAfterFile: File | null; // archivo nuevo a subir
  timeInitial: string;
  timeFinal: string;
  status: OrderStatus;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: string }> = {
  PENDING:     { label: 'Pendiente',   color: '#92400e', bg: '#fef3c7', icon: 'bi-hourglass-split' },
  IN_PROGRESS: { label: 'En proceso',  color: '#1e40af', bg: '#dbeafe', icon: 'bi-arrow-repeat' },
  COMPLETED:   { label: 'Completado',  color: '#065f46', bg: '#d1fae5', icon: 'bi-check-circle-fill' },
  CANCELLED:   { label: 'Cancelado',   color: '#7f1d1d', bg: '#fee2e2', icon: 'bi-x-circle-fill' },
};

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span
      className="badge rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1"
      style={{ background: cfg.bg, color: cfg.color, fontSize: '0.75rem' }}
    >
      <i className={`bi ${cfg.icon}`} style={{ fontSize: '0.7rem' }} />
      {cfg.label}
    </span>
  );
};

// ── Modal ──────────────────────────────────────────────────────────────────────

interface ModalProps {
  order: AdminOrder;
  form: EditForm;
  onChange: (f: EditForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  saving: boolean;
  error: string;
}

const EncargoModal = ({ order, form, onChange, onSubmit, onClose, saving, error }: ModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [imgError, setImgError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function processFile(file: File) {
    setImgError('');
    if (!file.type.startsWith('image/')) { setImgError('El archivo debe ser una imagen.'); return; }
    if (file.size > MAX_BYTES) { setImgError(`La imagen supera los ${MAX_MB} MB.`); return; }
    const preview = URL.createObjectURL(file);
    onChange({ ...form, imageAfterFile: file, imageAfter: preview });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function removeImageAfter() {
    if (form.imageAfterFile) URL.revokeObjectURL(form.imageAfter);
    onChange({ ...form, imageAfter: '', imageAfterFile: null });
    setImgError('');
  }

  return (
    <>
      <div className="modal-backdrop show" style={{ zIndex: 1040 }} onClick={onClose} />
      <div className="modal d-block" style={{ zIndex: 1050 }} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <form className="modal-content border-0 rounded-4 overflow-hidden shadow-lg" onSubmit={onSubmit}>

            <div className="modal-header border-0 px-4 pt-4 pb-2">
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: 40, height: 40, background: '#1a1f36' }}>
                  <i className="bi bi-clipboard2-check-fill text-white" />
                </div>
                <div>
                  <h5 className="modal-title fw-bold mb-0">Gestionar encargo</h5>
                  <small className="text-muted">{order.title}</small>
                </div>
              </div>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
            </div>

            <div className="modal-body px-4 py-3">
              {error && (
                <div className="alert alert-danger border-0 rounded-3 small py-2 mb-3">
                  <i className="bi bi-exclamation-triangle-fill me-2" />{error}
                </div>
              )}

              <div className="rounded-3 p-3 mb-4 small" style={{ background: '#f8f9fa' }}>
                <div className="fw-semibold mb-1">{order.title}</div>
                <div className="text-muted mb-2">{order.text}</div>
                <div className="text-muted d-flex align-items-center gap-2 flex-wrap">
                  <span><i className="bi bi-person me-1" />{order.user.name} {order.user.subname}</span>
                  <span>·</span>
                  <span>{order.user.email}</span>
                  {order.quantity && <span className="badge bg-secondary">{order.quantity} uds.</span>}
                  <span>·</span>
                  <span>{new Date(order.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Imagen de referencia del cliente */}
              {order.imageBefore && (
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: '.05em' }}>Imagen de referencia del cliente</label>
                  <img
                    src={order.imageBefore}
                    alt="Referencia del cliente"
                    className="img-fluid rounded-3 border d-block"
                    style={{ maxHeight: 220, objectFit: 'contain', background: '#f8f9fa' }}
                  />
                </div>
              )}

              {/* Estado */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: '.05em' }}>Estado del encargo</label>
                <div className="d-flex gap-2 flex-wrap">
                  {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    const isActive = form.status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                        style={{
                          background: isActive ? cfg.bg : 'transparent',
                          color: isActive ? cfg.color : '#6c757d',
                          border: `2px solid ${isActive ? cfg.color : '#dee2e6'}`,
                          fontWeight: isActive ? 600 : 400,
                          transition: 'all .15s',
                        }}
                        onClick={() => onChange({ ...form, status: s })}
                      >
                        <i className={`bi ${cfg.icon}`} style={{ fontSize: '0.7rem' }} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: '.05em' }}>Precio (€)</label>
                  <div className="input-group rounded-3 overflow-hidden">
                    <span className="input-group-text bg-light border-end-0">€</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control border-start-0"
                      value={form.price}
                      onChange={(e) => onChange({ ...form, price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: '.05em' }}>Fecha inicio</label>
                  <input type="date" className="form-control rounded-3" value={form.timeInitial} onChange={(e) => onChange({ ...form, timeInitial: e.target.value })} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: '.05em' }}>Fecha fin</label>
                  <input type="date" className="form-control rounded-3" value={form.timeFinal} onChange={(e) => onChange({ ...form, timeFinal: e.target.value })} />
                </div>

                {/* Imagen resultado */}
                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: '.05em' }}>
                    Imagen del resultado
                  </label>

                  {form.imageAfter ? (
                    <div className="rounded-3 overflow-hidden position-relative" style={{ border: '2px solid #e5e7eb' }}>
                      <img
                        src={form.imageAfter}
                        alt="Resultado"
                        style={{ width: '100%', maxHeight: 220, objectFit: 'contain', background: '#f8f9fa', display: 'block' }}
                      />
                      <div className="position-absolute bottom-0 start-0 end-0 px-3 py-2 d-flex align-items-center justify-content-between"
                        style={{ background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)' }}>
                        <span className="text-white small">
                          <i className="bi bi-image me-1" />
                          {form.imageAfterFile ? form.imageAfterFile.name : 'Imagen guardada'}
                          {form.imageAfterFile && ` · ${(form.imageAfterFile.size / 1024 / 1024).toFixed(1)} MB`}
                        </span>
                        <button
                          type="button"
                          onClick={removeImageAfter}
                          className="btn btn-sm border-0 d-flex align-items-center gap-1"
                          style={{ background: 'rgba(239,68,68,.85)', color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: '.78rem' }}
                        >
                          <i className="bi bi-trash3" /> Quitar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="rounded-3 d-flex flex-column align-items-center justify-content-center gap-2"
                      style={{
                        border: `2px dashed ${dragging ? '#1a1f36' : '#dee2e6'}`,
                        background: dragging ? '#f0f1f5' : '#f8f9fa',
                        padding: '1.75rem 1rem',
                        cursor: 'pointer',
                        transition: 'all .18s',
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                    >
                      <div className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{ width: 44, height: 44, background: dragging ? '#e2e4ee' : '#eee' }}>
                        <i className="bi bi-cloud-arrow-up" style={{ fontSize: '1.3rem', color: dragging ? '#1a1f36' : '#9ca3af' }} />
                      </div>
                      <div className="text-center">
                        <span className="small fw-semibold" style={{ color: dragging ? '#1a1f36' : '#374151' }}>
                          {dragging ? 'Suelta la imagen aquí' : 'Arrastra o haz clic para subir'}
                        </span>
                        <div className="small mt-1" style={{ color: '#9ca3af' }}>JPG, PNG, WEBP · máx. {MAX_MB} MB</div>
                      </div>
                    </div>
                  )}

                  {imgError && (
                    <div className="small mt-1" style={{ color: '#dc2626' }}>
                      <i className="bi bi-exclamation-circle me-1" />{imgError}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ''; }}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer border-0 px-4 pb-4 pt-2 gap-2">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-dark rounded-pill px-4" disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Guardando…</> : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// ── Panel ──────────────────────────────────────────────────────────────────────

const FILTER_OPTIONS: { value: OrderStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'IN_PROGRESS', label: 'En proceso' },
  { value: 'COMPLETED', label: 'Completados' },
  { value: 'CANCELLED', label: 'Cancelados' },
];

export const EncargosPanel = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [newCount, setNewCount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminOrder | null>(null);
  const [form, setForm] = useState<EditForm>({ price: '', imageAfter: '', imageAfterFile: null, timeInitial: '', timeFinal: '', status: 'PENDING' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    const socket: Socket = io(import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL?.replace('/api', '') ?? '', {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.emit('joinOrders');

    socket.on('newOrder', (order: AdminOrder) => {
      setOrders((prev) => [order, ...prev]);
      setNewCount((c) => c + 1);
    });

    socket.on('orderUpdated', (updated: AdminOrder) => {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    });

    return () => { socket.disconnect(); };
  }, []);

  const toInputDate = (iso?: string | null) => (iso ? iso.split('T')[0] : '');

  const openEdit = (o: AdminOrder) => {
    setEditTarget(o);
    setForm({
      price: o.price != null ? String(o.price) : '',
      imageAfter: o.imageAfter ?? '',
      imageAfterFile: null,
      timeInitial: toInputDate(o.timeInitial),
      timeFinal: toInputDate(o.timeFinal),
      status: o.status ?? 'PENDING',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    setFormError('');
    try {
      let imageAfter: string | undefined;
      if (form.imageAfterFile) {
        imageAfter = await fileToBase64(form.imageAfterFile);
      } else if (form.imageAfter) {
        imageAfter = form.imageAfter;
      }
      const updated = await updateOrder(editTarget.id, {
        price: form.price !== '' ? Number(form.price) : undefined,
        imageAfter,
        timeInitial: form.timeInitial || undefined,
        timeFinal: form.timeFinal || undefined,
        status: form.status,
      });
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      closeModal();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTabClick = () => setNewCount(0);

  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  if (loading)
    return <div className="text-center py-5"><div className="spinner-border" style={{ color: '#1a1f36' }} /></div>;
  if (error)
    return <div className="alert alert-danger rounded-3">{error}</div>;

  return (
    <div onClick={handleTabClick}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <div className="fw-bold fs-5 d-flex align-items-center gap-2">
            Encargos
            {newCount > 0 && (
              <span className="badge rounded-pill" style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem' }}>
                {newCount} nuevo{newCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="text-muted small">{orders.length} en total</div>
        </div>

        {/* Filtros */}
        <div className="d-flex gap-1 flex-wrap">
          {FILTER_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              className="btn btn-sm rounded-pill px-3"
              style={{
                background: filter === value ? '#1a1f36' : 'transparent',
                color: filter === value ? '#fff' : '#6c757d',
                border: `1px solid ${filter === value ? '#1a1f36' : '#dee2e6'}`,
                fontSize: '0.8rem',
              }}
              onClick={() => setFilter(value)}
            >
              {label}
              {value !== 'ALL' && (
                <span className="ms-1 opacity-75">
                  ({orders.filter((o) => o.status === value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-3" style={{ fontSize: '3rem', opacity: .25 }}><i className="bi bi-clipboard2" /></div>
          <div className="fw-semibold text-muted">
            {filter === 'ALL' ? 'Sin encargos todavía' : `No hay encargos ${FILTER_OPTIONS.find(f => f.value === filter)?.label.toLowerCase()}`}
          </div>
          {filter === 'ALL' && (
            <div className="text-muted small mt-1">Los nuevos encargos aparecerán aquí en tiempo real</div>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
            <thead>
              <tr className="small text-muted text-uppercase" style={{ letterSpacing: '.05em', fontSize: '0.72rem' }}>
                <th className="border-0 pb-2 ps-0">Encargo</th>
                <th className="border-0 pb-2">Usuario</th>
                <th className="border-0 pb-2">Estado</th>
                <th className="border-0 pb-2">Precio</th>
                <th className="border-0 pb-2">Fecha solicitud</th>
                <th className="border-0 pb-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
                  <td className="border-0 py-3 ps-0">
                    <div className="fw-semibold d-flex align-items-center gap-2">
                      {o.title}
                      {o.imageBefore && (
                        <i className="bi bi-image-fill text-muted" style={{ fontSize: '0.8rem' }} title="Tiene imagen de referencia" />
                      )}
                    </div>
                    <div className="text-muted small" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.text}
                    </div>
                    {o.quantity && <div className="text-muted small">{o.quantity} uds.</div>}
                  </td>
                  <td className="border-0">
                    <div className="small fw-medium">{o.user.name} {o.user.subname}</div>
                    <div className="small text-muted">{o.user.email}</div>
                  </td>
                  <td className="border-0">
                    <StatusBadge status={o.status ?? 'PENDING'} />
                  </td>
                  <td className="border-0">
                    {o.price != null
                      ? <span className="fw-semibold">{o.price} €</span>
                      : <span className="text-muted">—</span>}
                  </td>
                  <td className="border-0 small text-muted">
                    {new Date(o.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="border-0 text-end">
                    <button className="btn btn-sm btn-light rounded-pill px-3" onClick={() => openEdit(o)} title="Gestionar">
                      <i className="bi bi-pencil" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && editTarget && (
        <EncargoModal
          order={editTarget}
          form={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          onClose={closeModal}
          saving={saving}
          error={formError}
        />
      )}
    </div>
  );
};
