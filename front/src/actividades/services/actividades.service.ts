import type { Actividad, CategoriaActividad, ContentBlock } from '../types/actividad.interface';

const API = import.meta.env.VITE_API_URL as string;
const token = () => localStorage.getItem('jwt_token') ?? '';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token()}`,
});

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message ?? `Error ${res.status}`);
  }
  const json = await res.json();
  return (json.data ?? json) as T;
}

// ── Públicas ──────────────────────────────────────────────────────────────────

export const getActividades = (): Promise<Actividad[]> =>
  fetch(`${API}/actividades`).then((r) => handle<Actividad[]>(r));

export const getActividadById = (id: number): Promise<Actividad> =>
  fetch(`${API}/actividades/${id}`).then((r) => handle<Actividad>(r));

export const getCategorias = (): Promise<CategoriaActividad[]> =>
  fetch(`${API}/actividades/categorias`).then((r) =>
    handle<CategoriaActividad[]>(r),
  );

// ── Admin (requieren JWT) ─────────────────────────────────────────────────────

export const createActividad = (data: {
  title: string;
  description: string;
  date: string;
  coverImage?: string;
  categoryId?: number;
  blocks?: ContentBlock[];
}): Promise<Actividad> =>
  fetch(`${API}/actividades`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then((r) => handle<Actividad>(r));

export const updateActividad = (
  id: number,
  data: {
    title?: string;
    description?: string;
    date?: string;
    coverImage?: string;
    categoryId?: number | null;
    blocks?: ContentBlock[];
  },
): Promise<Actividad> =>
  fetch(`${API}/actividades/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then((r) => handle<Actividad>(r));

export const deleteActividad = (id: number): Promise<void> =>
  fetch(`${API}/actividades/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then((r) => {
    if (!r.ok) throw new Error(`Error ${r.status}`);
  });

export const createCategoria = (
  name: string,
  color: string,
): Promise<CategoriaActividad> =>
  fetch(`${API}/actividades/categorias`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name, color }),
  }).then((r) => handle<CategoriaActividad>(r));

export const deleteCategoria = (id: number): Promise<void> =>
  fetch(`${API}/actividades/categorias/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then((r) => {
    if (!r.ok) throw new Error(`Error ${r.status}`);
  });
