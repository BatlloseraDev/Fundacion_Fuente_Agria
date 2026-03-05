import { createContext } from "react";
import type{Role,User, AuthStatus} from './types/user.types'

interface UserContextProps{
    authStatus: AuthStatus;
    user: User | null;
    isAuthenticated: boolean;
    login: (token:string) =>void;
    logout: () => void;
    hasRole: (allowedRoles: Role[]) => boolean;
    //para el equipo esto lo he implementado adicionalmente a lo que tiene Inma
    //es una funcion para comporbar si tiene el rol necesario para x acción como tenemos distintos roles...
}

export const UserContext = createContext({} as UserContextProps);