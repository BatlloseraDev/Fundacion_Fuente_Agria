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

export interface AdminOrder {
  id: number;
  title: string;
  text: string;
  quantity?: number | null;
  imageBefore?: string | null;
  imageAfter?: string | null;
  active: boolean;
  price?: number | null;
  timeInitial?: string | null;
  timeFinal?: string | null;
  user: {
    id: number;
    name: string;
    subname: string;
    email: string;
  };
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
