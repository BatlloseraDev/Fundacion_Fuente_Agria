import { useEffect, useRef, useState } from 'react';
import type { Actividad, CategoriaActividad, ContentBlock } from '../../actividades/types/actividad.interface';
import {
  getActividades, getCategorias,
  createActividad, updateActividad, deleteActividad,
  createCategoria, deleteCategoria,
} from '../../actividades/services/actividades.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

const toInputDate = (d: string) => new Date(d).toISOString().slice(0, 10);

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

const COLORS = ['primary', 'success', 'warning', 'danger', 'info', 'secondary', 'dark'];

const COLOR_HEX: Record<string, string> = {
  primary: '#0d6efd', success: '#198754', warning: '#ffc107',
  danger: '#dc3545', info: '#0dcaf0', secondary: '#6c757d', dark: '#212529',
};

// ── Estado del formulario ─────────────────────────────────────────────────────

type EditorForm = {
  title: string;
  description: string;
  date: string;
  coverImage: string;
  categoryId: number | '';
  blocks: ContentBlock[];
};

const EMPTY: EditorForm = {
  title: '', description: '', date: '', coverImage: '', categoryId: '', blocks: [],
};

// ── Bloque individual ─────────────────────────────────────────────────────────

interface BlockProps {
  block: ContentBlock;
  index: number;
  total: number;
  onChange: (content: string) => void;
  onDelete: () => void;
  onMove: (dir: 'up' | 'down') => void;
}

const Block = ({ block, index, total, onChange, onDelete, onMove }: BlockProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(await fileToBase64(file));
  };

  return (
    <div
      className="rounded-4 mb-2 position-relative"
      style={{ border: '2px solid #e9ecef', background: block.type === 'image' ? '#f8f9fa' : '#fff' }}
    >
      {/* Toolbar del bloque */}
      <div
        className="d-flex align-items-center gap-1 px-3 py-2 border-bottom"
        style={{ background: '#f8f9fa', borderRadius: '14px 14px 0 0' }}
      >
        <span
          className="badge rounded-pill me-1"
          style={{ background: block.type === 'image' ? '#e3f2fd' : '#e8f5e9', color: block.type === 'image' ? '#1565c0' : '#2e7d32', fontSize: '0.7rem' }}
        >
          <i className={`bi ${block.type === 'image' ? 'bi-image' : 'bi-text-paragraph'} me-1`} />
          {block.type === 'image' ? 'Imagen' : 'Texto'}
        </span>
        <span className="text-muted small ms-1" style={{ fontSize: '0.72rem' }}>bloque {index + 1}</span>
        <div className="ms-auto d-flex gap-1">
          <button type="button" className="btn btn-sm btn-light rounded-3 px-2 py-1" disabled={index === 0} onClick={() => onMove('up')} title="Subir">
            <i className="bi bi-chevron-up" style={{ fontSize: '0.75rem' }} />
          </button>
          <button type="button" className="btn btn-sm btn-light rounded-3 px-2 py-1" disabled={index === total - 1} onClick={() => onMove('down')} title="Bajar">
            <i className="bi bi-chevron-down" style={{ fontSize: '0.75rem' }} />
          </button>
          <button type="button" className="btn btn-sm rounded-3 px-2 py-1" style={{ background: '#fff0f0', color: '#dc3545' }} onClick={onDelete} title="Eliminar bloque">
            <i className="bi bi-trash3" style={{ fontSize: '0.75rem' }} />
          </button>
        </div>
      </div>

      {/* Contenido del bloque */}
      <div className="p-3">
        {block.type === 'text' ? (
          <textarea
            className="form-control border-0 bg-transparent p-0"
            rows={4}
            placeholder="Escribe el texto de este párrafo..."
            value={block.content}
            onChange={(e) => onChange(e.target.value)}
            style={{ resize: 'vertical', fontSize: '0.95rem', lineHeight: 1.7 }}
          />
        ) : (
          <div className="text-center">
            {block.content ? (
              <div className="position-relative d-inline-block">
                <img
                  src={block.content}
                  alt={`Bloque imagen ${index + 1}`}
                  className="rounded-3 img-fluid"
                  style={{ maxHeight: 220, maxWidth: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle p-0 d-flex align-items-center justify-content-center"
                  style={{ width: 28, height: 28 }}
                  onClick={() => { onChange(''); if (fileRef.current) fileRef.current.value = ''; }}
                >
                  <i className="bi bi-x" />
                </button>
              </div>
            ) : (
              <label
                className="d-flex flex-column align-items-center justify-content-center rounded-3 py-4 px-3"
                style={{ cursor: 'pointer', border: '2px dashed #dee2e6', minHeight: 120 }}
              >
                <i className="bi bi-cloud-arrow-up" style={{ fontSize: '2rem', color: '#adb5bd' }} />
                <span className="text-muted small mt-2">Haz clic para subir imagen</span>
                <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handleImageFile} />
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Separador entre bloques ───────────────────────────────────────────────────

const BlockSeparator = ({ onAddText, onAddImage }: { onAddText: () => void; onAddImage: () => void }) => (
  <div className="d-flex align-items-center gap-2 my-1" style={{ opacity: 0, transition: 'opacity .15s' }}
    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0')}
  >
    <div style={{ flex: 1, height: 1, background: '#dee2e6' }} />
    <button type="button" className="btn btn-sm rounded-pill px-3" style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: '0.78rem' }} onClick={onAddText}>
      <i className="bi bi-plus-lg me-1" />Texto
    </button>
    <button type="button" className="btn btn-sm rounded-pill px-3" style={{ background: '#e3f2fd', color: '#1565c0', fontSize: '0.78rem' }} onClick={onAddImage}>
      <i className="bi bi-plus-lg me-1" />Imagen
    </button>
    <div style={{ flex: 1, height: 1, background: '#dee2e6' }} />
  </div>
);

// ── Editor principal ──────────────────────────────────────────────────────────

interface EditorProps {
  initial: EditorForm;
  editTarget: Actividad | null;
  categorias: CategoriaActividad[];
  onSaved: (act: Actividad) => void;
  onCancel: () => void;
}

const ActividadEditor = ({ initial, editTarget, categorias, onSaved, onCancel }: EditorProps) => {
  const [form, setForm] = useState<EditorForm>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const coverRef = useRef<HTMLInputElement>(null);

  const setField = <K extends keyof EditorForm>(k: K, v: EditorForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // ── Bloques ──────────────────────────────────────────────────────────────────
  const insertBlock = (type: ContentBlock['type'], afterIndex?: number) => {
    const newBlock: ContentBlock = { type, content: '' };
    const blocks = [...form.blocks];
    if (afterIndex === undefined) blocks.push(newBlock);
    else blocks.splice(afterIndex + 1, 0, newBlock);
    setField('blocks', blocks);
  };

  const updateBlock = (index: number, content: string) => {
    const blocks = [...form.blocks];
    blocks[index] = { ...blocks[index], content };
    setField('blocks', blocks);
  };

  const deleteBlock = (index: number) => {
    setField('blocks', form.blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, dir: 'up' | 'down') => {
    const blocks = [...form.blocks];
    const target = dir === 'up' ? index - 1 : index + 1;
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
    setField('blocks', blocks);
  };

  // ── Portada ──────────────────────────────────────────────────────────────────
  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setField('coverImage', await fileToBase64(file));
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        date: new Date(form.date).toISOString(),
        coverImage: form.coverImage || undefined,
        categoryId: form.categoryId !== '' ? form.categoryId : undefined,
        blocks: form.blocks,
      };
      const result = editTarget
        ? await updateActividad(editTarget.id, payload)
        : await createActividad(payload);
      onSaved(result);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const selectedCat = categorias.find((c) => c.id === form.categoryId);

  return (
    <form onSubmit={handleSubmit}>
      {/* ── Barra superior ───────────────────────────────────────────────────── */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3" style={{ borderBottom: '2px solid #f0f2f5' }}>
        <button type="button" className="btn btn-light rounded-pill px-3 d-flex align-items-center gap-2" onClick={onCancel}>
          <i className="bi bi-arrow-left" /> Volver
        </button>
        <div className="fw-bold fs-5 text-center flex-grow-1">
          {editTarget ? 'Editar actividad' : 'Nueva actividad'}
        </div>
        <button type="submit" className="btn rounded-pill px-4 d-flex align-items-center gap-2" style={{ background: '#1a1f36', color: '#fff' }} disabled={saving}>
          {saving ? <><span className="spinner-border spinner-border-sm" /> Guardando…</> : <><i className="bi bi-floppy2-fill" /> Guardar</>}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger border-0 rounded-3 small py-2 mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2" />{error}
        </div>
      )}

      <div className="row g-4">

        {/* ── Columna principal ───────────────────────────────────────────────── */}
        <div className="col-lg-8">

          {/* Portada */}
          <div
            className="rounded-4 mb-4 overflow-hidden position-relative d-flex align-items-center justify-content-center"
            style={{ minHeight: 220, background: '#f0f2f5', cursor: 'pointer', border: '2px dashed #dee2e6' }}
            onClick={() => coverRef.current?.click()}
          >
            {form.coverImage ? (
              <>
                <img src={form.coverImage} alt="Portada" className="w-100 h-100" style={{ objectFit: 'cover', maxHeight: 260 }} />
                <button
                  type="button"
                  className="btn btn-dark btn-sm position-absolute top-0 end-0 m-3 rounded-pill px-3"
                  onClick={(e) => { e.stopPropagation(); setField('coverImage', ''); if (coverRef.current) coverRef.current.value = ''; }}
                >
                  <i className="bi bi-x-lg me-1" />Quitar
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-image" style={{ fontSize: '2.5rem', color: '#adb5bd' }} />
                <div className="text-muted small mt-2 fw-semibold">Haz clic para añadir imagen de portada</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Recomendado: 1200×600 px</div>
              </div>
            )}
            <input ref={coverRef} type="file" accept="image/*" className="d-none" onChange={handleCoverFile} />
          </div>

          {/* Título */}
          <div className="mb-3">
            <input
              className="form-control form-control-lg border-0 border-bottom rounded-0 px-0 fw-bold"
              style={{ fontSize: '1.5rem', boxShadow: 'none', background: 'transparent' }}
              placeholder="Título de la actividad"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              required
            />
          </div>

          {/* Descripción */}
          <div className="mb-4">
            <textarea
              className="form-control border-0 border-bottom rounded-0 px-0"
              style={{ boxShadow: 'none', background: 'transparent', resize: 'none', fontSize: '1.05rem', color: '#555' }}
              rows={2}
              placeholder="Descripción breve (aparece en la tarjeta)"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              required
            />
          </div>

          {/* Editor de bloques */}
          <div className="mb-2">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="fw-semibold text-muted small text-uppercase" style={{ letterSpacing: '.08em' }}>
                <i className="bi bi-layout-text-window me-2" />Contenido
              </span>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-sm rounded-pill px-3" style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: '0.8rem' }} onClick={() => insertBlock('text')}>
                  <i className="bi bi-plus-lg me-1" />Párrafo
                </button>
                <button type="button" className="btn btn-sm rounded-pill px-3" style={{ background: '#e3f2fd', color: '#1565c0', fontSize: '0.8rem' }} onClick={() => insertBlock('image')}>
                  <i className="bi bi-plus-lg me-1" />Imagen
                </button>
              </div>
            </div>

            {form.blocks.length === 0 && (
              <div
                className="rounded-4 d-flex flex-column align-items-center justify-content-center py-5"
                style={{ border: '2px dashed #dee2e6', color: '#adb5bd' }}
              >
                <i className="bi bi-layout-text-window" style={{ fontSize: '2rem' }} />
                <div className="small mt-2">Añade párrafos e imágenes para construir la crónica</div>
              </div>
            )}

            {form.blocks.map((block, i) => (
              <div key={i}>
                <Block
                  block={block} index={i} total={form.blocks.length}
                  onChange={(c) => updateBlock(i, c)}
                  onDelete={() => deleteBlock(i)}
                  onMove={(d) => moveBlock(i, d)}
                />
                <BlockSeparator
                  onAddText={() => insertBlock('text', i)}
                  onAddImage={() => insertBlock('image', i)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Columna lateral ─────────────────────────────────────────────────── */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: 16 }}>

            {/* Fecha */}
            <div
              className="rounded-4 p-4 mb-3"
              style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}
            >
              <label className="form-label small fw-semibold text-muted text-uppercase mb-2" style={{ letterSpacing: '.06em' }}>
                <i className="bi bi-calendar3 me-2" />Fecha
              </label>
              <input
                type="date"
                className="form-control rounded-3"
                value={form.date}
                onChange={(e) => setField('date', e.target.value)}
                required
              />
            </div>

            {/* Categoría */}
            <div
              className="rounded-4 p-4 mb-3"
              style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}
            >
              <label className="form-label small fw-semibold text-muted text-uppercase mb-2" style={{ letterSpacing: '.06em' }}>
                <i className="bi bi-tag me-2" />Categoría
              </label>

              {categorias.length === 0 ? (
                <div className="text-muted small">Sin categorías disponibles</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {/* Opción "sin categoría" */}
                  <label
                    className="d-flex align-items-center gap-2 rounded-3 px-3 py-2"
                    style={{ cursor: 'pointer', border: `2px solid ${form.categoryId === '' ? '#1a1f36' : '#dee2e6'}`, background: form.categoryId === '' ? '#f0f2f5' : '#fff' }}
                  >
                    <input type="radio" className="d-none" checked={form.categoryId === ''} onChange={() => setField('categoryId', '')} />
                    <span className="text-muted small">Sin categoría</span>
                  </label>
                  {categorias.map((cat) => (
                    <label
                      key={cat.id}
                      className="d-flex align-items-center gap-2 rounded-3 px-3 py-2"
                      style={{ cursor: 'pointer', border: `2px solid ${form.categoryId === cat.id ? COLOR_HEX[cat.color ?? 'primary'] ?? '#1a1f36' : '#dee2e6'}`, background: form.categoryId === cat.id ? `${COLOR_HEX[cat.color ?? 'primary']}18` : '#fff' }}
                    >
                      <input type="radio" className="d-none" checked={form.categoryId === cat.id} onChange={() => setField('categoryId', cat.id)} />
                      <span className={`badge bg-${cat.color ?? 'secondary'} rounded-pill`} style={{ fontSize: '0.75rem' }}>{cat.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Resumen */}
            {(form.title || selectedCat) && (
              <div
                className="rounded-4 p-4"
                style={{ background: '#1a1f36', color: 'rgba(255,255,255,0.85)' }}
              >
                <div className="small fw-semibold text-uppercase mb-2" style={{ letterSpacing: '.06em', opacity: .6 }}>Vista previa</div>
                {selectedCat && (
                  <span className={`badge bg-${selectedCat.color ?? 'secondary'} rounded-pill mb-2`}>{selectedCat.name}</span>
                )}
                {form.title && <div className="fw-bold" style={{ lineHeight: 1.3 }}>{form.title}</div>}
                {form.date && <div className="mt-1" style={{ fontSize: '0.8rem', opacity: .6 }}>
                  <i className="bi bi-calendar3 me-1" />
                  {new Date(form.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>}
                <div className="mt-2" style={{ fontSize: '0.78rem', opacity: .5 }}>
                  {form.blocks.length} bloque{form.blocks.length !== 1 ? 's' : ''} de contenido
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

// ── Modal de categoría ────────────────────────────────────────────────────────

const CategoriaModal = ({ onSave, onClose }: { onSave: (n: string, c: string) => Promise<void>; onClose: () => void }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('primary');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try { await onSave(name, color); }
    catch (e: any) { setError(e.message); setSaving(false); }
  };

  return (
    <>
      <div className="modal-backdrop show" style={{ zIndex: 1040 }} onClick={onClose} />
      <div className="modal d-block" style={{ zIndex: 1050 }} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <form className="modal-content border-0 rounded-4 shadow-lg" onSubmit={submit}>
            <div className="modal-header border-0 px-4 pt-4 pb-2">
              <h5 className="modal-title fw-bold mb-0">Nueva categoría</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body px-4 py-3">
              {error && <div className="alert alert-danger border-0 rounded-3 small py-2 mb-3">{error}</div>}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: '.05em' }}>Nombre</label>
                <input className="form-control rounded-3" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
              </div>
              <div>
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: '.05em' }}>Color</label>
                <div className="d-flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button key={c} type="button" title={c}
                      className={`rounded-circle border-0 ${color === c ? 'shadow' : ''}`}
                      style={{ width: 28, height: 28, background: COLOR_HEX[c], outline: color === c ? `3px solid ${COLOR_HEX[c]}` : 'none', outlineOffset: 2 }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
                <div className="mt-2">
                  <span className={`badge bg-${color} rounded-pill px-3 py-2`}>{name || 'Previsualización'}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 px-4 pb-4 pt-2 gap-2">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-dark rounded-pill px-4" disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm" /> : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// ── Panel principal ───────────────────────────────────────────────────────────

type View = 'list' | 'editor';

export const ActividadesPanel = () => {
  const [view, setView] = useState<View>('list');
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [categorias, setCategorias] = useState<CategoriaActividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editTarget, setEditTarget] = useState<Actividad | null>(null);
  const [editorInitial, setEditorInitial] = useState<EditorForm>(EMPTY);
  const [isCatModal, setIsCatModal] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [acts, cats] = await Promise.all([getActividades(), getCategorias()]);
      setActividades(acts);
      setCategorias(cats);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditTarget(null);
    setEditorInitial(EMPTY);
    setView('editor');
  };

  const openEdit = (act: Actividad) => {
    setEditTarget(act);
    setEditorInitial({
      title: act.title,
      description: act.description,
      date: toInputDate(act.date),
      coverImage: act.coverImage ?? '',
      categoryId: act.categoryId ?? '',
      blocks: act.blocks,
    });
    setView('editor');
  };

  const handleSaved = (act: Actividad) => {
    setActividades((prev) =>
      editTarget ? prev.map((a) => (a.id === act.id ? act : a)) : [act, ...prev],
    );
    setView('list');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta actividad?')) return;
    try {
      await deleteActividad(id);
      setActividades((prev) => prev.filter((a) => a.id !== id));
    } catch (e: any) { alert(e.message); }
  };

  const handleCreateCat = async (name: string, color: string) => {
    const cat = await createCategoria(name, color);
    setCategorias((prev) => [...prev, cat]);
    setIsCatModal(false);
  };

  const handleDeleteCat = async (id: number) => {
    if (!confirm('¿Dar de baja esta categoría? (borrado lógico)')) return;
    try {
      await deleteCategoria(id);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: '#1a1f36' }} /></div>;
  if (error) return <div className="alert alert-danger rounded-3">{error}</div>;

  // ── Vista: editor ────────────────────────────────────────────────────────────
  if (view === 'editor') {
    return (
      <ActividadEditor
        initial={editorInitial}
        editTarget={editTarget}
        categorias={categorias}
        onSaved={handleSaved}
        onCancel={() => setView('list')}
      />
    );
  }

  // ── Vista: lista ─────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Cabecera */}
      <div className="d-flex justify-content-between align-items-start mb-5">
        <div>
          <div className="fw-bold fs-5">Actividades</div>
          <div className="text-muted small">{actividades.length} publicadas</div>
        </div>
        <button
          className="btn rounded-pill px-4 d-flex align-items-center gap-2"
          style={{ background: '#1a1f36', color: '#fff' }}
          onClick={openNew}
        >
          <i className="bi bi-plus-lg" />
          <span className="d-none d-sm-inline">Nueva actividad</span>
        </button>
      </div>

      {/* Grid de actividades */}
      {actividades.length === 0 ? (
        <div className="text-center py-5 mb-5">
          <div className="mb-3" style={{ fontSize: '3rem', opacity: .2 }}><i className="bi bi-calendar-event" /></div>
          <div className="fw-semibold text-muted">Sin actividades todavía</div>
          <div className="text-muted small mt-1">Crea la primera con el botón de arriba</div>
        </div>
      ) : (
        <div className="row g-4 mb-5">
          {actividades.map((act) => {
            const colorClass = act.category?.color ?? 'secondary';
            return (
              <div key={act.id} className="col-md-6 col-xl-4">
                <div
                  className="rounded-4 overflow-hidden h-100 d-flex flex-column"
                  style={{ border: '1px solid #e9ecef', boxShadow: '0 2px 8px rgba(0,0,0,.06)', background: '#fff' }}
                >
                  {/* Imagen */}
                  <div
                    className={`bg-${colorClass} bg-opacity-10 d-flex align-items-center justify-content-center`}
                    style={{ height: 160, flexShrink: 0 }}
                  >
                    {act.coverImage
                      ? <img src={act.coverImage} alt={act.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                      : <i className={`bi bi-image text-${colorClass}`} style={{ fontSize: '2.5rem', opacity: .3 }} />
                    }
                  </div>

                  {/* Contenido */}
                  <div className="p-3 d-flex flex-column flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      {act.category
                        ? <span className={`badge bg-${colorClass} rounded-pill`} style={{ fontSize: '0.72rem' }}>{act.category.name}</span>
                        : <span />
                      }
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        <i className="bi bi-calendar3 me-1" />{fmtDate(act.date)}
                      </span>
                    </div>
                    <div className="fw-semibold mb-1" style={{ lineHeight: 1.3 }}>{act.title}</div>
                    <div className="text-muted small mb-3 flex-grow-1" style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {act.description}
                    </div>
                    <div className="d-flex gap-2 mt-auto">
                      <button className="btn btn-sm btn-light rounded-pill flex-grow-1" onClick={() => openEdit(act)}>
                        <i className="bi bi-pencil me-1" />Editar
                      </button>
                      <button
                        className="btn btn-sm rounded-pill px-3"
                        style={{ background: '#fff0f0', color: '#dc3545' }}
                        onClick={() => handleDelete(act.id)}
                        title="Eliminar"
                      >
                        <i className="bi bi-trash3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sección de categorías */}
      <div
        className="rounded-4 p-4"
        style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <span className="fw-semibold">Categorías</span>
            <span className="text-muted small ms-2">{categorias.length} activas</span>
          </div>
          <button
            className="btn btn-sm btn-outline-dark rounded-pill px-3 d-flex align-items-center gap-1"
            onClick={() => setIsCatModal(true)}
          >
            <i className="bi bi-plus-lg" /> Nueva
          </button>
        </div>

        {categorias.length === 0 ? (
          <div className="text-muted small">Sin categorías. Crea una para poder asignarla a las actividades.</div>
        ) : (
          <div className="d-flex flex-wrap gap-2">
            {categorias.map((cat) => (
              <div key={cat.id} className="d-flex align-items-center gap-1 rounded-pill pe-1" style={{ background: `${COLOR_HEX[cat.color ?? 'secondary']}18`, border: `1px solid ${COLOR_HEX[cat.color ?? 'secondary']}40` }}>
                <span className={`badge bg-${cat.color ?? 'secondary'} rounded-pill px-3 py-2 m-1`}>{cat.name}</span>
                <button
                  className="btn btn-sm p-0 rounded-circle d-flex align-items-center justify-content-center me-1"
                  style={{ width: 20, height: 20, color: '#dc3545', background: 'transparent' }}
                  onClick={() => handleDeleteCat(cat.id)}
                  title="Dar de baja (borrado lógico)"
                >
                  <i className="bi bi-x" style={{ fontSize: 14 }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isCatModal && (
        <CategoriaModal onSave={handleCreateCat} onClose={() => setIsCatModal(false)} />
      )}
    </div>
  );
};
