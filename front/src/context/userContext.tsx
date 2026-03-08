import { createContext } from "react";
import type{Role,User, AuthStatus} from './types/user.types'

interface UserContextProps {
  authStatus: AuthStatus;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  hasRole: (allowedRoles: Role[]) => boolean;
}

export const UserContext = createContext({} as UserContextProps);
