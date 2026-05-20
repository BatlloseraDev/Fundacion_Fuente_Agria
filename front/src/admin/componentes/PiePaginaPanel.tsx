import { useEffect, useRef, useState } from 'react';
import type { FooterCollaborator, FooterConfig } from '../types/admin.types';
import { getFooterConfig, saveFooterConfig } from '../services/admin.service';

const MAX_MB = 2;
const MAX_BYTES = MAX_MB * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const DEFAULT_CONFIG: FooterConfig = {
  description: 'Encargos de artesanía y servicio de reparación y restauración de muebles de madera.',
  contact: { address: 'Puertollano, Ciudad Real', phone: '+34 900 000 000', email: 'contacto@fuenteagria.org', hours: 'L–V 9:00–14:00' },
  collaborators: [],
};

// ── Tarjeta de colaborador ────────────────────────────────────────────────────

interface CollabCardProps {
  collab: FooterCollaborator;
  onChange: (c: FooterCollaborator) => void;
  onRemove: () => void;
}

const CollabCard = ({ collab, onChange, onRemove }: CollabCardProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [imgError, setImgError] = useState('');

  const processFile = async (file: File) => {
    setImgError('');
    if (!file.type.startsWith('image/')) { setImgError('Debe ser una imagen.'); return; }
    if (file.size > MAX_BYTES) { setImgError(`Máximo ${MAX_MB} MB.`); return; }
    const b64 = await fileToBase64(file);
    onChange({ ...collab, imageUrl: b64 });
  };

  return (
    <div
      className="rounded-3 p-3 d-flex flex-column gap-2"
      style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}
    >
      {/* Vista previa imagen */}
      <div
        className="rounded-3 d-flex align-items-center justify-content-center overflow-hidden position-relative"
        style={{ height: 90, background: '#fff', border: `2px dashed ${dragging ? '#1a1f36' : '#dee2e6'}`, cursor: 'pointer', transition: 'border-color .15s' }}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f); }}
      >
        {collab.imageUrl ? (
          <img src={collab.imageUrl} alt={collab.name} style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }} />
        ) : (
          <div className="text-center">
            <i className="bi bi-image text-muted" style={{ fontSize: '1.5rem' }} />
            <div className="small text-muted mt-1" style={{ fontSize: '0.72rem' }}>Arrastra o haz clic</div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="d-none"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ''; }} />
      </div>
      {imgError && <div className="small text-danger">{imgError}</div>}

      {/* Nombre */}
      <input
        type="text"
        className="form-control form-control-sm rounded-3"
        placeholder="Nombre de la entidad"
        value={collab.name}
        onChange={(e) => onChange({ ...collab, name: e.target.value })}
      />

      {/* Eliminar */}
      <button
        type="button"
        className="btn btn-sm btn-outline-danger rounded-pill"
        onClick={onRemove}
      >
        <i className="bi bi-trash3 me-1" />Eliminar
      </button>
    </div>
  );
};

// ── Panel principal ───────────────────────────────────────────────────────────

export const PiePaginaPanel = () => {
  const [config, setConfig]   = useState<FooterConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    getFooterConfig()
      .then(setConfig)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setContact = (key: keyof FooterConfig['contact'], value: string) =>
    setConfig((c) => ({ ...c, contact: { ...c.contact, [key]: value } }));

  const addCollaborator = () =>
    setConfig((c) => ({
      ...c,
      collaborators: [...c.collaborators, { id: crypto.randomUUID(), name: '', imageUrl: '' }],
    }));

  const updateCollaborator = (id: string, updated: FooterCollaborator) =>
    setConfig((c) => ({ ...c, collaborators: c.collaborators.map((col) => (col.id === id ? updated : col)) }));

  const removeCollaborator = (id: string) =>
    setConfig((c) => ({ ...c, collaborators: c.collaborators.filter((col) => col.id !== id) }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await saveFooterConfig(config);
      window.dispatchEvent(new CustomEvent('footer-config-updated'));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="text-center py-5"><div className="spinner-border" style={{ color: '#1a1f36' }} /></div>;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <div className="fw-bold fs-5">Pie de página</div>
          <div className="text-muted small">Edita el contenido que se muestra en el footer del sitio</div>
        </div>
        <button
          className="btn rounded-pill px-4 d-flex align-items-center gap-2"
          style={{ background: '#1a1f36', color: '#fff' }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving
            ? <><span className="spinner-border spinner-border-sm" />Guardando…</>
            : <><i className="bi bi-floppy-fill" />Guardar cambios</>}
        </button>
      </div>

      {error && <div className="alert alert-danger rounded-3 small mb-4">{error}</div>}
      {saved  && (
        <div className="alert rounded-3 small mb-4 d-flex align-items-center gap-2"
          style={{ background: '#d1fae5', color: '#065f46', border: 'none' }}>
          <i className="bi bi-check-circle-fill" />Cambios guardados correctamente.
        </div>
      )}

      <div className="row g-4">

        {/* ── Descripción ── */}
        <div className="col-12">
          <div className="rounded-3 p-4" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
            <SectionLabel icon="bi-file-text" label="Descripción de la fundación" />
            <textarea
              className="form-control rounded-3 mt-2"
              rows={3}
              value={config.description}
              onChange={(e) => setConfig((c) => ({ ...c, description: e.target.value }))}
            />
          </div>
        </div>

        {/* ── Contacto ── */}
        <div className="col-12 col-lg-6">
          <div className="rounded-3 p-4 h-100" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
            <SectionLabel icon="bi-telephone" label="Información de contacto" />
            <div className="d-flex flex-column gap-3 mt-3">
              <FormField icon="bi-geo-alt" label="Dirección"
                value={config.contact.address}
                onChange={(v) => setContact('address', v)} />
              <FormField icon="bi-telephone" label="Teléfono"
                value={config.contact.phone}
                onChange={(v) => setContact('phone', v)} />
              <FormField icon="bi-envelope" label="Email"
                value={config.contact.email}
                type="email"
                onChange={(v) => setContact('email', v)} />
              <FormField icon="bi-clock" label="Horario"
                value={config.contact.hours}
                onChange={(v) => setContact('hours', v)} />
            </div>
          </div>
        </div>

        {/* ── Colaboradores ── */}
        <div className="col-12 col-lg-6">
          <div className="rounded-3 p-4" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <SectionLabel icon="bi-building" label="Entidades colaboradoras" />
              <button
                type="button"
                className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                style={{ background: '#1a1f36', color: '#fff', fontSize: '0.8rem' }}
                onClick={addCollaborator}
              >
                <i className="bi bi-plus-lg" />Añadir
              </button>
            </div>

            {config.collaborators.length === 0 ? (
              <div className="text-center py-4">
                <div style={{ fontSize: '2.5rem', opacity: 0.15 }}><i className="bi bi-building" /></div>
                <div className="text-muted small mt-2">Sin entidades colaboradoras</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Haz clic en "Añadir" para agregar una</div>
              </div>
            ) : (
              <div className="row g-3">
                {config.collaborators.map((col) => (
                  <div key={col.id} className="col-12 col-sm-6">
                    <CollabCard
                      collab={col}
                      onChange={(updated) => updateCollaborator(col.id, updated)}
                      onRemove={() => removeCollaborator(col.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Vista previa ── */}
        <div className="col-12">
          <div className="rounded-3 p-4" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
            <SectionLabel icon="bi-eye" label="Vista previa del footer" />
            <div className="mt-3 rounded-3 overflow-hidden" style={{ border: '1px solid #dee2e6' }}>
              <FooterPreview config={config} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Utilidades UI ─────────────────────────────────────────────────────────────

const SectionLabel = ({ icon, label }: { icon: string; label: string }) => (
  <div className="d-flex align-items-center gap-2">
    <i className={`bi ${icon}`} style={{ color: '#1a1f36' }} />
    <span className="fw-semibold small" style={{ color: '#1a1f36' }}>{label}</span>
  </div>
);

interface FormFieldProps {
  icon: string;
  label: string;
  value: string;
  type?: string;
  onChange: (v: string) => void;
}

const FormField = ({ icon, label, value, type = 'text', onChange }: FormFieldProps) => (
  <div>
    <label className="form-label small text-muted mb-1">
      <i className={`bi ${icon} me-1`} />{label}
    </label>
    <input
      type={type}
      className="form-control form-control-sm rounded-3"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

// ── Vista previa del footer (mini render) ─────────────────────────────────────

const FooterPreview = ({ config }: { config: FooterConfig }) => (
  <div style={{ background: '#fff', padding: '1.5rem 2rem', fontSize: '0.82rem' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem' }}>

      {/* Descripción */}
      <div>
        <div className="fw-semibold mb-1">Fundación Fuente Agria</div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Asociación sin ánimo de lucro</div>
        <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.75rem' }}>{config.description}</p>
      </div>

      {/* Contacto */}
      <div>
        <div className="fw-semibold mb-2">Contacto</div>
        <div className="text-muted d-flex flex-column gap-1" style={{ fontSize: '0.75rem' }}>
          {config.contact.address && <span>📍 {config.contact.address}</span>}
          {config.contact.phone   && <span>📞 {config.contact.phone}</span>}
          {config.contact.email   && <span>✉️ {config.contact.email}</span>}
          {config.contact.hours   && <span>🕒 {config.contact.hours}</span>}
        </div>
      </div>

      {/* Colaboradores */}
      {config.collaborators.length > 0 && (
        <div>
          <div className="fw-semibold mb-2">Entidades colaboradoras</div>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            {config.collaborators.map((col) => (
              col.imageUrl ? (
                <img key={col.id} src={col.imageUrl} alt={col.name} style={{ maxHeight: 32, maxWidth: 80, objectFit: 'contain' }} />
              ) : (
                <span key={col.id} className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>{col.name || '?'}</span>
              )
            ))}
          </div>
        </div>
      )}
    </div>

    <div style={{ borderTop: '1px solid #e9ecef', marginTop: '1rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#6c757d' }}>
      <span>© {new Date().getFullYear()} Fundación Fuente Agria · Todos los derechos reservados</span>
      <span className="d-flex gap-3">
        <span>Aviso legal</span>
        <span>Privacidad</span>
        <span>Cookies</span>
      </span>
    </div>
  </div>
);
