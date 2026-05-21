import { useEffect, useState } from 'react';
import type { AdminUser, AdminRole } from '../types/admin.types';
import {
  getColaboradores,
  createColaborador,
  updateColaborador,
  deleteColaborador,
  getRoles,
} from '../services/admin.service';

const EMPTY_FORM = { name: '', subname: '', email: '', password: '' };

function initials(name: string, subname: string) {
  return `${name.charAt(0)}${subname.charAt(0)}`.toUpperCase();
}

const AVATAR_COLORS = [
  '#4361ee','#3a0ca3','#7209b7','#f72585','#4cc9f0',
  '#06d6a0','#118ab2','#ef476f','#ffd166','#073b4c',
];
function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

// ── Modal ──────────────────────────────────────────────────────────────────────

interface ModalProps {
  editTarget: AdminUser | null;
  form: typeof EMPTY_FORM;
  onChange: (form: typeof EMPTY_FORM) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  saving: boolean;
  error: string;
}

const ColaboradorModal = ({ editTarget, form, onChange, onSubmit, onClose, saving, error }: ModalProps) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      <div className="modal-backdrop show" style={{ zIndex: 1040 }} onClick={onClose} />
      <div className="modal d-block" style={{ zIndex: 1050 }} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <form className="modal-content border-0 rounded-4 overflow-hidden shadow-lg" onSubmit={onSubmit}>

            <div className="modal-header border-0 px-4 pt-4 pb-2">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ width: 40, height: 40, background: '#1a1f36' }}
                >
                  <i className={`bi ${editTarget ? 'bi-pencil-fill' : 'bi-person-plus-fill'} text-white`} />
                </div>
                <h5 className="modal-title fw-bold mb-0">
                  {editTarget ? 'Editar colaborador' : 'Nuevo colaborador'}
                </h5>
              </div>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
            </div>

            <div className="modal-body px-4 py-3">
              {error && (
                <div className="alert alert-danger border-0 rounded-3 small py-2 mb-3">
                  <i className="bi bi-exclamation-triangle-fill me-2" />{error}
                </div>
              )}
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: '.05em' }}>Nombre</label>
                  <input className="form-control rounded-3" value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} required autoFocus />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: '.05em' }}>Apellidos</label>
                  <input className="form-control rounded-3" value={form.subname} onChange={(e) => onChange({ ...form, subname: e.target.value })} required />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: '.05em' }}>Email</label>
                  <input type="email" className="form-control rounded-3" value={form.email} onChange={(e) => onChange({ ...form, email: e.target.value })} required />
                </div>
                {!editTarget && (
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: '.05em' }}>Contraseña</label>
                    <input type="password" className="form-control rounded-3" value={form.password} onChange={(e) => onChange({ ...form, password: e.target.value })} required minLength={6} />
                    <div className="form-text">Mínimo 6 caracteres</div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer border-0 px-4 pb-4 pt-2 gap-2">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-dark rounded-pill px-4" disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Guardando…</> : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// ── Panel ──────────────────────────────────────────────────────────────────────

export const ColaboradoresPanel = () => {
  const [colaboradores, setColaboradores] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const colaboradorRoleId = roles.find((r) => r.name === 'EDITOR')?.id;

  const load = async () => {
    try {
      setLoading(true);
      const [users, allRoles] = await Promise.all([getColaboradores(), getRoles()]);
      setColaboradores(users);
      setRoles(allRoles);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setFormError(''); setIsModalOpen(true); };
  const openEdit = (user: AdminUser) => { setEditTarget(user); setForm({ name: user.name, subname: user.subname, email: user.email, password: '' }); setFormError(''); setIsModalOpen(true); };
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colaboradorRoleId) { setFormError('El rol EDITOR no existe en la base de datos.'); return; }
    if (!editTarget && !form.password) { setFormError('La contraseña es obligatoria.'); return; }
    setSaving(true); setFormError('');
    try {
      if (editTarget) {
        const updated = await updateColaborador(editTarget.id, { name: form.name, subname: form.subname, email: form.email });
        setColaboradores((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await createColaborador({ ...form, roleIds: [colaboradorRoleId] });
        setColaboradores((prev) => [...prev, created]);
      }
      closeModal();
    } catch (e: any) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Dar de baja a este colaborador?')) return;
    try {
      await deleteColaborador(id);
      setColaboradores((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: '#1a1f36' }} /></div>;
  if (error) return <div className="alert alert-danger rounded-3">{error}</div>;

  return (
    <div>
      {/* Cabecera del panel */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="fw-bold fs-5">Colaboradores</div>
          <div className="text-muted small">{colaboradores.length} registrados</div>
        </div>
        <button
          className="btn rounded-pill px-4 d-flex align-items-center gap-2"
          style={{ background: '#1a1f36', color: '#fff' }}
          onClick={openAdd}
        >
          <i className="bi bi-plus-lg" />
          <span className="d-none d-sm-inline">Nuevo colaborador</span>
        </button>
      </div>

      {!colaboradorRoleId && (
        <div className="alert alert-warning rounded-3 border-0 small d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill" />
          <span>El rol <strong>EDITOR</strong> no existe en la BD.</span>
        </div>
      )}

      {colaboradores.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-3" style={{ fontSize: '3rem', opacity: .25 }}><i className="bi bi-people" /></div>
          <div className="fw-semibold text-muted">Sin colaboradores todavía</div>
          <div className="text-muted small mt-1">Añade el primero con el botón de arriba</div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
            <thead>
              <tr className="small text-muted text-uppercase" style={{ letterSpacing: '.05em', fontSize: '0.72rem' }}>
                <th className="border-0 pb-2 ps-0">Colaborador</th>
                <th className="border-0 pb-2">Email</th>
                <th className="border-0 pb-2">Alta</th>
                <th className="border-0 pb-2" />
              </tr>
            </thead>
            <tbody>
              {colaboradores.map((c) => (
                <tr
                  key={c.id}
                  className="rounded"
                  style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}
                >
                  <td className="border-0 py-3 ps-0">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white fw-bold"
                        style={{ width: 38, height: 38, fontSize: 13, background: avatarColor(c.id) }}
                      >
                        {initials(c.name, c.subname)}
                      </div>
                      <div>
                        <div className="fw-semibold">{c.name} {c.subname}</div>
                      </div>
                    </div>
                  </td>
                  <td className="border-0 text-muted small">{c.email}</td>
                  <td className="border-0 text-muted small">{new Date(c.createdAt).toLocaleDateString('es-ES')}</td>
                  <td className="border-0 text-end">
                    <button className="btn btn-sm btn-light rounded-pill me-1 px-3" onClick={() => openEdit(c)} title="Editar">
                      <i className="bi bi-pencil" />
                    </button>
                    <button className="btn btn-sm rounded-pill px-3" style={{ background: '#fff0f0', color: '#dc3545' }} onClick={() => handleDelete(c.id)} title="Dar de baja">
                      <i className="bi bi-person-dash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <ColaboradorModal
          editTarget={editTarget} form={form} onChange={setForm}
          onSubmit={handleSubmit} onClose={closeModal} saving={saving} error={formError}
        />
      )}
    </div>
  );
};
