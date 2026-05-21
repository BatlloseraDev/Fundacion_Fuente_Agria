export type RoleName = 'ADMIN' | 'USER' | 'EDITOR';

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  subname: string;
  address?: string | null;
  dni?: string | null;
  roles: Array<{
    id: number;
    userId: number;
    roleId: number;
    role: { id: number; name: RoleName };
  }>;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
  subname: string;
};

export type LoginData = {
  user: AuthUser;
  accessToken: string;
};

export type RegisterData = {
  user: AuthUser;
  accessToken: string;
};