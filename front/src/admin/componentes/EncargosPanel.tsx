import { useEffect, useState } from 'react';
import type { AdminOrder } from '../types/admin.types';
import { getOrders, updateOrder } from '../services/admin.service';

interface EditForm { price: string; imageAfter: string; timeInitial: string; timeFinal: string; active: boolean }

// ── Modal ──────────────────────────────────────────────────────────────────────

interface ModalProps {
  order: AdminOrder; form: EditForm;
  onChange: (f: EditForm) => void; onSubmit: (e: React.FormEvent) => void;
  onClose: () => void; saving: boolean; error: string;
}

const EncargoModal = ({ order, form, onChange, onSubmit, onClose, saving, error }: ModalProps) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

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
                  <h5 className="modal-title fw-bold mb-0">Editar encargo</h5>
                  <small className="text-muted">{order.title}</small>
                </div>
              </div>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
            </div>

            <div className="modal-body px-4 py-3">
              {error && <div className="alert alert-danger border-0 rounded-3 small py-2 mb-3"><i className="bi bi-exclamation-triangle-fill me-2" />{error}</div>}

              <div className="rounded-3 p-3 mb-3 small" style={{ background: '#f8f9fa' }}>
                <div className="text-muted mb-1"><i className="bi bi-chat-text me-1" />{order.text}</div>
                <div className="text-muted">
                  <i className="bi bi-person me-1" />
                  {order.user.name} {order.user.subname}
                  <span className="ms-1">· {order.user.email}</span>
                  {order.quantity && <span className="ms-2 badge bg-secondary">{order.quantity} uds.</span>}
                </div>
              </div>

              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: '.05em' }}>Precio (€)</label>
                  <div className="input-group rounded-3 overflow-hidden">
                    <span className="input-group-text bg-light border-end-0">€</span>
                    <input type="number" step="0.01" min="0" className="form-control border-start-0" value={form.price} onChange={(e) => onChange({ ...form, price: e.target.value })} autoFocus />
                  </div>
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: '.05em' }}>Estado</label>
                  <div className="d-flex gap-2 mt-1">
                    {[{ v: 'true', label: 'Activo', color: '#06d6a0' }, { v: 'false', label: 'Completado', color: '#6c757d' }].map(({ v, label, color }) => (
                      <button
                        key={v} type="button"
                        className="btn btn-sm rounded-pill px-3 flex-fill"
                        style={{
                          background: String(form.active) === v ? color : 'transparent',
                          color: String(form.active) === v ? '#fff' : color,
                          border: `2px solid ${color}`,
                          transition: 'all .15s',
                        }}
                        onClick={() => onChange({ ...form, active: v === 'true' })}
                      >
                        {label}
                      </button>
                    ))}
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
                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: '.05em' }}>URL imagen resultado</label>
                  <input type="url" className="form-control rounded-3" placeholder="https://…" value={form.imageAfter} onChange={(e) => onChange({ ...form, imageAfter: e.target.value })} />
                </div>
                {form.imageAfter && (
                  <div className="col-12">
                    <img src={form.imageAfter} alt="Resultado" className="img-fluid rounded-3 border" style={{ maxHeight: 160 }} />
                  </div>
                )}
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

export const EncargosPanel = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminOrder | null>(null);
  const [form, setForm] = useState<EditForm>({ price: '', imageAfter: '', timeInitial: '', timeFinal: '', active: true });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    getOrders().then(setOrders).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const toInputDate = (iso?: string | null) => (iso ? iso.split('T')[0] : '');

  const openEdit = (o: AdminOrder) => {
    setEditTarget(o);
    setForm({ price: o.price != null ? String(o.price) : '', imageAfter: o.imageAfter ?? '', timeInitial: toInputDate(o.timeInitial), timeFinal: toInputDate(o.timeFinal), active: o.active });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true); setFormError('');
    try {
      const updated = await updateOrder(editTarget.id, {
        price: form.price !== '' ? Number(form.price) : undefined,
        imageAfter: form.imageAfter || undefined,
        timeInitial: form.timeInitial || undefined,
        timeFinal: form.timeFinal || undefined,
        active: form.active,
      });
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      closeModal();
    } catch (e: any) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: '#1a1f36' }} /></div>;
  if (error) return <div className="alert alert-danger rounded-3">{error}</div>;

  return (
    <div>
      <div className="mb-4">
        <div className="fw-bold fs-5">Encargos</div>
        <div className="text-muted small">{orders.length} registrados</div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-3" style={{ fontSize: '3rem', opacity: .25 }}><i className="bi bi-clipboard2" /></div>
          <div className="fw-semibold text-muted">Sin encargos todavía</div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
            <thead>
              <tr className="small text-muted text-uppercase" style={{ letterSpacing: '.05em', fontSize: '0.72rem' }}>
                <th className="border-0 pb-2 ps-0">Encargo</th>
                <th className="border-0 pb-2">Usuario</th>
                <th className="border-0 pb-2">Precio</th>
                <th className="border-0 pb-2">Estado</th>
                <th className="border-0 pb-2">Periodo</th>
                <th className="border-0 pb-2" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
                  <td className="border-0 py-3 ps-0">
                    <div className="fw-semibold">{o.title}</div>
                    {o.quantity && <div className="text-muted small">{o.quantity} uds.</div>}
                  </td>
                  <td className="border-0">
                    <div className="small fw-medium">{o.user.name} {o.user.subname}</div>
                    <div className="small text-muted">{o.user.email}</div>
                  </td>
                  <td className="border-0">
                    {o.price != null
                      ? <span className="fw-semibold">{o.price} €</span>
                      : <span className="text-muted">—</span>}
                  </td>
                  <td className="border-0">
                    <span
                      className="badge rounded-pill px-3 py-1"
                      style={{ background: o.active ? '#d4f5e9' : '#e9ecef', color: o.active ? '#0a6640' : '#495057' }}
                    >
                      {o.active ? 'Activo' : 'Completado'}
                    </span>
                  </td>
                  <td className="border-0 small text-muted">
                    {o.timeInitial || o.timeFinal
                      ? <>{o.timeInitial ? new Date(o.timeInitial).toLocaleDateString('es-ES') : '—'} → {o.timeFinal ? new Date(o.timeFinal).toLocaleDateString('es-ES') : '—'}</>
                      : '—'}
                  </td>
                  <td className="border-0 text-end">
                    <button className="btn btn-sm btn-light rounded-pill px-3" onClick={() => openEdit(o)} title="Editar">
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
        <EncargoModal order={editTarget} form={form} onChange={setForm} onSubmit={handleSubmit} onClose={closeModal} saving={saving} error={formError} />
      )}
    </div>
  );
};
