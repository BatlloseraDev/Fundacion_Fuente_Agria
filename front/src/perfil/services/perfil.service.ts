const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function authHeaders() {
  const token = localStorage.getItem('jwt_token') ?? localStorage.getItem('accessToken') ?? '';
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  subname: string;
  address: string | null;
  dni: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  subname?: string;
  address?: string;
  dni?: string;
  avatarUrl?: string;
  email?: string;
  password?: string;
}

export async function getMyProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/users/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudo cargar el perfil');
  const body = await res.json();
  return body.data ?? body;
}

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/users/me`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.data?.message ?? err.message ?? 'No se pudo actualizar el perfil');
  }
  const body = await res.json();
  return body.data ?? body;
}
