import type {
  ApiResponse,
  LoginData,
  LoginRequest,
  RegisterData,
  RegisterRequest,
} from '../types/auth.types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, options: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      (json && (json.message || json.error)) ||
      `HTTP ${res.status}`;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : String(msg));
  }

  return json as ApiResponse<T>;
}

export async function loginApi(body: LoginRequest) {
  return request<LoginData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function registerApi(body: RegisterRequest) {
  return request<RegisterData>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function saveAuth(accessToken: string, user: unknown) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('jwt_token', accessToken);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user');
}

export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export async function googleLoginApi(idToken: string) {
  return request<LoginData>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

export async function requestPasswordReset(email: string) {
  return request<{ message: string }>('/auth/recovery/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(email: string, token: string, newPassword: string) {
  return request<{ message: string }>('/auth/recovery/reset', {
    method: 'POST',
    body: JSON.stringify({ email, token, newPassword }),
  });
}
