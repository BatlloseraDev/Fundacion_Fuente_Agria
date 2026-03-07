import { createContext, useEffect, useState, type PropsWithChildren } from "react";
import { jwtDecode } from "jwt-decode";

export type Role = "ADMIN" | "EDITOR" | "USER";

export interface User {
  id: string;
  email: string;
  roles: Role[];
}

type AuthStatus = "checking" | "not-authenticated" | "authenticated";

interface UserContextProps {
  authStatus: AuthStatus;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  hasRole: (allowedRoles: Role[]) => boolean;
}

export const UserContext = createContext({} as UserContextProps);

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (token: string) => {
    try {
      const decodedToken: any = jwtDecode(token);

      const loggedUser: User = {
        id: String(decodedToken.sub),
        email: String(decodedToken.email),
        roles: (decodedToken.roles ?? []) as Role[],
      };

      setUser(loggedUser);
      setAuthStatus("authenticated");
      localStorage.setItem("accessToken", token);
    } catch (error) {
      console.log(error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthStatus("not-authenticated");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  const hasRole = (allowedRoles: Role[]) => {
    if (!user) return false;
    return allowedRoles.some((role) => user.roles.includes(role));
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) handleLogin(token);
    else handleLogout();
  }, []);

  return (
    <UserContext value={{ authStatus, user, isAuthenticated: authStatus === "authenticated", login: handleLogin, logout: handleLogout, hasRole }}>
      {children}
    </UserContext>
  );
};