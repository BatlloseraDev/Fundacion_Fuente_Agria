export interface AdminUserRole {
  role: {
    id: number;
    name: string;
  };
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  subname: string;
  address?: string | null;
  dni?: string | null;
  createdAt: string;
  updatedAt: string;
  roles: AdminUserRole[];
}

export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ReservationStatus = 'RESERVED' | 'CANCELLED' | 'COLLECTED';

export interface AdminOrder {
  id: number;
  title: string;
  text: string;
  quantity?: number | null;
  imageBefore?: string | null;
  imageAfter?: string | null;
  active: boolean;
  status: OrderStatus;
  price?: number | null;
  timeInitial?: string | null;
  timeFinal?: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    subname: string;
    email: string;
  };
}

export interface AdminReservationArticle {
  id: number;
  articleId: number;
  quantity: number;
  estimatedPrice: number;
  article: {
    id: number;
    name: string;
    image?: string | null;
  };
}

export interface AdminReservation {
  id: number;
  ticketCode: string;
  status: ReservationStatus;
  date: string;
  createdAt: string;
  reservationExpiresAt?: string | null;
  daysRemaining?: number | null;
  total: number;
  user: {
    id: number;
    name: string;
    subname: string;
    email: string;
  };
  articles: AdminReservationArticle[];
}

export interface AdminChat {
  id: number;
  user: {
    id: number;
    name: string;
    subname: string;
    email: string;
    avatarUrl?: string | null;
  };
  messages: Array<{
    message: string;
    createdAt: string;
  }>;
}

export interface AdminMessage {
  id: number;
  message: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    subname: string;
    avatarUrl?: string | null;
  };
}

export interface AdminRole {
  id: number;
  name: string;
}

// ── Facturación ───────────────────────────────────────────────────────────────

export interface BillingOrder {
  id: number;
  title: string;
  text: string;
  status: OrderStatus;
  price: number | null;
  createdAt: string;
  timeInitial: string | null;
  timeFinal: string | null;
}

export interface BillingPurchaseArticle {
  id: number;
  articleId: number;
  quantity: number;
  estimatedPrice: number;
  article: { id: number; name: string; image?: string | null };
}

export interface BillingPurchase {
  id: number;
  ticketCode: string | null;
  status: ReservationStatus;
  date: string;
  createdAt: string;
  reservationExpiresAt: string | null;
  total: number;
  articles: BillingPurchaseArticle[];
}

export interface UserBilling {
  user: {
    id: number;
    name: string;
    subname: string;
    email: string;
    dni: string | null;
    address: string | null;
  };
  orders: BillingOrder[];
  purchases: BillingPurchase[];
}
