import type { AdminUser, AdminOrder, AdminChat, AdminMessage, AdminRole, AdminReservation, OrderStatus, UserBilling, FooterConfig } from '../types/admin.types';

const apiUrl = () => import.meta.env.VITE_API_URL as string;
const token = () => localStorage.getItem('jwt_token') ?? '';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token()}`,
});

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message ?? `Error ${res.status}`);
  }
  const json = await res.json();
  return (json.data ?? json) as T;
}

// ── Roles ─────────────────────────────────────────────────────────────────────

export const getRoles = (): Promise<AdminRole[]> =>
  fetch(`${apiUrl()}/roles`, { headers: authHeaders() }).then((r) =>
    handleResponse<AdminRole[]>(r),
  );

// ── Colaboradores (usuarios con rol EDITOR) ────────────────────────────────────

export const getColaboradores = (): Promise<AdminUser[]> =>
  fetch(`${apiUrl()}/users/by-role/EDITOR`, { headers: authHeaders() }).then((r) =>
    handleResponse<AdminUser[]>(r),
  );

export const createColaborador = (data: {
  email: string;
  password: string;
  name: string;
  subname: string;
  roleIds: number[];
}): Promise<AdminUser> =>
  fetch(`${apiUrl()}/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then((r) => handleResponse<AdminUser>(r));

export const updateColaborador = (
  id: number,
  data: { name?: string; subname?: string; email?: string; roleIds?: number[] },
): Promise<AdminUser> =>
  fetch(`${apiUrl()}/users/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then((r) => handleResponse<AdminUser>(r));

export const deleteColaborador = (id: number): Promise<void> =>
  fetch(`${apiUrl()}/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then((r) => handleResponse<void>(r));

// ── Usuarios / Editores ────────────────────────────────────────────────────────

export const getAllUsers = (): Promise<AdminUser[]> =>
  fetch(`${apiUrl()}/users`, { headers: authHeaders() }).then((r) =>
    handleResponse<AdminUser[]>(r),
  );

export const updateUser = (
  id: number,
  data: { name?: string; subname?: string; email?: string; roleIds?: number[] },
): Promise<AdminUser> =>
  fetch(`${apiUrl()}/users/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then((r) => handleResponse<AdminUser>(r));

export const deleteUser = (id: number): Promise<void> =>
  fetch(`${apiUrl()}/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then((r) => handleResponse<void>(r));

// ── Encargos / Orders ─────────────────────────────────────────────────────────

export const getOrders = (): Promise<AdminOrder[]> =>
  fetch(`${apiUrl()}/orders`, { headers: authHeaders() }).then((r) =>
    handleResponse<AdminOrder[]>(r),
  );

export const updateOrder = (
  id: number,
  data: {
    price?: number;
    imageAfter?: string;
    timeInitial?: string;
    timeFinal?: string;
    active?: boolean;
    status?: OrderStatus;
  },
): Promise<AdminOrder> =>
  fetch(`${apiUrl()}/orders/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then((r) => handleResponse<AdminOrder>(r));

// Reservas de catalogo

export const getReservations = (): Promise<AdminReservation[]> =>
  fetch(`${apiUrl()}/cart/reservations`, { headers: authHeaders() }).then((r) =>
    handleResponse<AdminReservation[]>(r),
  );

export const cancelReservation = (id: number): Promise<AdminReservation> =>
  fetch(`${apiUrl()}/cart/reservations/${id}/cancel`, {
    method: 'PATCH',
    headers: authHeaders(),
  }).then((r) => handleResponse<AdminReservation>(r));

export const collectReservation = (id: number): Promise<AdminReservation> =>
  fetch(`${apiUrl()}/cart/reservations/${id}/collect`, {
    method: 'PATCH',
    headers: authHeaders(),
  }).then((r) => handleResponse<AdminReservation>(r));

// ── Facturación ───────────────────────────────────────────────────────────────

export const getUserBilling = (userId: number): Promise<UserBilling> =>
  fetch(`${apiUrl()}/users/${userId}/billing`, { headers: authHeaders() }).then((r) =>
    handleResponse<UserBilling>(r),
  );

// ── Chats / Soporte ───────────────────────────────────────────────────────────

export const getChats = (): Promise<AdminChat[]> =>
  fetch(`${apiUrl()}/chats`, { headers: authHeaders() }).then((r) =>
    handleResponse<AdminChat[]>(r),
  );

export const getChatMessages = (chatId: number): Promise<AdminMessage[]> =>
  fetch(`${apiUrl()}/chats/${chatId}/messages`, { headers: authHeaders() }).then((r) =>
    handleResponse<AdminMessage[]>(r),
  );

// ── Footer config ─────────────────────────────────────────────────────────────

export const getFooterConfig = (): Promise<FooterConfig> =>
  fetch(`${apiUrl()}/pages/footer`).then((r) => handleResponse<FooterConfig>(r));

export const saveFooterConfig = (data: FooterConfig): Promise<FooterConfig> =>
  fetch(`${apiUrl()}/pages/footer`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then((r) => handleResponse<FooterConfig>(r));
