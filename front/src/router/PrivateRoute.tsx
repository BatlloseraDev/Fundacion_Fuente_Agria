import { use, type JSX } from "react";
import { UserContext } from "../context/userContext";
import type { Role } from "../context/types/user.types";
import { Navigate } from "react-router";


interface Props {
  element: JSX.Element;
  allowedRoles?: Role[];
}

export const PrivateRoute = ({ element, allowedRoles }: Props) => {
  const { authStatus, hasRole } = use(UserContext);

  if (authStatus === 'checking') {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  if (authStatus === 'not-authenticated') {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return element;
};