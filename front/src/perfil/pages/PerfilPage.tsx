import { useEffect, useState } from 'react';
import { getMyProfile, updateMyProfile, type UserProfile } from '../services/perfil.service';

export function PerfilPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    subname: '',
    email: '',
    address: '',
    dni: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    getMyProfile()
      .then((data) => {
        setProfile(data);
        setForm((f) => ({
          ...f,
          name: data.name,
          subname: data.subname,
          email: data.email,
          address: data.address ?? '',
          dni: data.dni ?? '',
        }));
      })
      .catch(() => setError('No se pudo cargar el perfil.'))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSuccess('');
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const payload: Record<string, string> = {
        name: form.name,
        subname: form.subname,
        email: form.email,
        address: form.address,
        dni: form.dni,
      };
      if (form.password) payload.password = form.password;

      const updated = await updateMyProfile(payload);
      setProfile(updated);
      setForm((f) => ({ ...f, password: '', confirmPassword: '' }));
      setSuccess('Perfil actualizado correctamente.');
    } catch (err: any) {
      setError(err.message ?? 'Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || 'No se pudo cargar el perfil.'}</div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: '680px' }}>
      <h2 className="fw-bold mb-1">Mi perfil</h2>
      <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
        Miembro desde {new Date(profile.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Datos personales */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-person" />
              Datos personales
            </h6>

            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label small fw-medium">Nombre</label>
                <input
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label small fw-medium">Apellidos</label>
                <input
                  className="form-control"
                  name="subname"
                  value={form.subname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-medium">Correo electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label small fw-medium">DNI</label>
                <input
                  className="form-control"
                  name="dni"
                  value={form.dni}
                  onChange={handleChange}
                  placeholder="Opcional"
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label small fw-medium">Dirección</label>
                <input
                  className="form-control"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Opcional"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cambio de contraseña */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h6 className="fw-semibold mb-1 d-flex align-items-center gap-2">
              <i className="bi bi-lock" />
              Cambiar contraseña
            </h6>
            <p className="text-muted mb-3" style={{ fontSize: '0.82rem' }}>
              Déjalo en blanco si no quieres cambiarla.
            </p>

            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label small fw-medium">Nueva contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label small fw-medium">Confirmar contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite la contraseña"
                />
              </div>
            </div>
          </div>
        </div>

        {success && <div className="alert alert-success py-2">{success}</div>}
        {error && <div className="alert alert-danger py-2">{error}</div>}

        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-primary px-4" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Guardando…
              </>
            ) : (
              <>
                <i className="bi bi-check2 me-1" />
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
