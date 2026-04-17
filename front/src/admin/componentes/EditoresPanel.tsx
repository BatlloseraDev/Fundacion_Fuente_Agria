import { useEffect, useState } from 'react';
import type { AdminUser, AdminRole } from '../types/admin.types';
import { getAllUsers, updateUser, deleteUser, getRoles } from '../services/admin.service';

interface EditForm { name: string; subname: string; email: string; roleIds: number[] }

const AVATAR_COLORS = [
  '#4361ee','#3a0ca3','#7209b7','#f72585','#4cc9f0',
  '#06d6a0','#118ab2','#ef476f','#ffd166','#073b4c',
];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function initials(name: string, subname: string) { return `${name.charAt(0)}${subname.charAt(0)}`.toUpperCase(); }

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#1a1f36',
  EDITOR: '#4361ee',
  USER: '#6c757d',
  COLABORADOR: '#06d6a0',
};

// ── Modal ──────────────────────────────────────────────────────────────────────

interface ModalProps {
  form: EditForm; roles: AdminRole[];
  onChange: (f: EditForm) => void; onSubmit: (e: React.FormEvent) => void;
  onClose: () => void; saving: boolean; error: string;
}

const EditUserModal = ({ form, roles, onChange, onSubmit, onClose, saving, error }: ModalProps) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const toggleRole = (id: number) =>
    onChange({ ...form, roleIds: form.roleIds.includes(id) ? form.roleIds.filter((r) => r !== id) : [...form.roleIds, id] });

  return (
    <>
      <div className="modal-backdrop show" style={{ zIndex: 1040 }} onClick={onClose} />
      <div className="modal d-block" style={{ zIndex: 1050 }} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <form className="modal-content border-0 rounded-4 overflow-hidden shadow-lg" onSubmit={onSubmit}>

            <div className="modal-header border-0 px-4 pt-4 pb-2">
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: 40, height: 40, background: '#1a1f36' }}>
                  <i className="bi bi-person-gear-fill text-white" />
                </div>
                <h5 className="modal-title fw-bold mb-0">Editar usuario</h5>
              </div>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
            </div>

            <div className="modal-body px-4 py-3">
              {error && <div className="alert alert-danger border-0 rounded-3 small py-2 mb-3"><i className="bi bi-exclamation-triangle-fill me-2" />{error}</div>}
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
                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: '.05em' }}>Roles</label>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {roles.map((role) => {
                      const active = form.roleIds.includes(role.id);
                      const color = ROLE_COLORS[role.name] ?? '#6c757d';
                      return (
                        <button
                          key={role.id} type="button"
                          onClick={() => toggleRole(role.id)}
                          className="btn btn-sm rounded-pill px-3"
                          style={{
                            background: active ? color : 'transparent',
                            color: active ? '#fff' : color,
                            border: `2px solid ${color}`,
                            transition: 'all .15s',
                          }}
                        >
                          {active && <i className="bi bi-check2 me-1" />}
                          {role.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
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

export const EditoresPanel = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<EditForm>({ name: '', subname: '', email: '', roleIds: [] });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAllUsers(), getRoles()])
      .then(([u, r]) => { setUsers(u); setRoles(r); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const openEdit = (u: AdminUser) => {
    setEditTarget(u);
    setForm({ name: u.name, subname: u.subname, email: u.email, roleIds: u.roles.map((r) => r.role.id) });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true); setFormError('');
    try {
      const updated = await updateUser(editTarget.id, form);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      closeModal();
    } catch (e: any) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Dar de baja a este usuario?')) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e: any) { alert(e.message); }
  };

  const filtered = users.filter((u) => {
    const matchesSearch = [u.name, u.subname, u.email].some((f) =>
      f.toLowerCase().includes(search.toLowerCase()),
    );
    const matchesRole = roleFilter === null || u.roles.some((ur) => ur.role.name === roleFilter);
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: '#1a1f36' }} /></div>;
  if (error) return <div className="alert alert-danger rounded-3">{error}</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="fw-bold fs-5">Usuarios registrados</div>
          <div className="text-muted small">{users.length} en total</div>
        </div>
        <div className="input-group input-group-sm rounded-pill overflow-hidden border" style={{ width: 220, boxShadow: 'none' }}>
          <span className="input-group-text bg-white border-0 ps-3"><i className="bi bi-search text-muted" /></span>
          <input
            className="form-control border-0 bg-white"
            placeholder="Buscar usuario…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filtros por rol */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          className="btn btn-sm rounded-pill px-3"
          style={{
            background: roleFilter === null ? '#1a1f36' : 'transparent',
            color: roleFilter === null ? '#fff' : '#1a1f36',
            border: '2px solid #1a1f36',
            transition: 'all .15s',
          }}
          onClick={() => setRoleFilter(null)}
        >
          Todos
          <span
            className="ms-2 badge rounded-pill"
            style={{ background: roleFilter === null ? 'rgba(255,255,255,0.25)' : '#e9ecef', color: roleFilter === null ? '#fff' : '#495057', fontSize: '0.7rem' }}
          >
            {users.length}
          </span>
        </button>
        {roles.map((role) => {
          const count = users.filter((u) => u.roles.some((ur) => ur.role.name === role.name)).length;
          const color = ROLE_COLORS[role.name] ?? '#6c757d';
          const isActive = roleFilter === role.name;
          return (
            <button
              key={role.id}
              className="btn btn-sm rounded-pill px-3"
              style={{
                background: isActive ? color : 'transparent',
                color: isActive ? '#fff' : color,
                border: `2px solid ${color}`,
                transition: 'all .15s',
              }}
              onClick={() => setRoleFilter(isActive ? null : role.name)}
            >
              {role.name}
              <span
                className="ms-2 badge rounded-pill"
                style={{ background: isActive ? 'rgba(255,255,255,0.25)' : '#f0f0f0', color: isActive ? '#fff' : '#495057', fontSize: '0.7rem' }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-3" style={{ fontSize: '3rem', opacity: .25 }}><i className="bi bi-people" /></div>
          <div className="fw-semibold text-muted">Sin resultados</div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
            <thead>
              <tr className="small text-muted text-uppercase" style={{ letterSpacing: '.05em', fontSize: '0.72rem' }}>
                <th className="border-0 pb-2 ps-0">Usuario</th>
                <th className="border-0 pb-2">Email</th>
                <th className="border-0 pb-2">Roles</th>
                <th className="border-0 pb-2">Alta</th>
                <th className="border-0 pb-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
                  <td className="border-0 py-3 ps-0">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white fw-bold"
                        style={{ width: 38, height: 38, fontSize: 13, background: avatarColor(u.id) }}
                      >
                        {initials(u.name, u.subname)}
                      </div>
                      <div className="fw-semibold">{u.name} {u.subname}</div>
                    </div>
                  </td>
                  <td className="border-0 text-muted small">{u.email}</td>
                  <td className="border-0">
                    <div className="d-flex flex-wrap gap-1">
                      {u.roles.map((ur) => (
                        <span
                          key={ur.role.id}
                          className="badge rounded-pill px-2 py-1"
                          style={{ background: ROLE_COLORS[ur.role.name] ?? '#6c757d', fontSize: '0.7rem' }}
                        >
                          {ur.role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="border-0 text-muted small">{new Date(u.createdAt).toLocaleDateString('es-ES')}</td>
                  <td className="border-0 text-end">
                    <button className="btn btn-sm btn-light rounded-pill me-1 px-3" onClick={() => openEdit(u)} title="Editar">
                      <i className="bi bi-pencil" />
                    </button>
                    <button className="btn btn-sm rounded-pill px-3" style={{ background: '#fff0f0', color: '#dc3545' }} onClick={() => handleDelete(u.id)} title="Dar de baja">
                      <i className="bi bi-person-dash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && editTarget && (
        <EditUserModal form={form} roles={roles} onChange={setForm} onSubmit={handleSubmit} onClose={closeModal} saving={saving} error={formError} />
      )}
    </div>
  );
};
