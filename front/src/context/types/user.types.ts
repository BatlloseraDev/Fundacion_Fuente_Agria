export interface User{
    id: string;
    username: string;
    roles: Role[]; //tenemos que asegurarnos de enviar esto a traves del JWT
}

export type Role = 'admin' | 'editor' | 'user' | 'ADMIN' | 'EDITOR' | 'USER' | 'COLABORADOR';

export type AuthStatus = 'checking' | 'not-authenticated' | 'authenticated';