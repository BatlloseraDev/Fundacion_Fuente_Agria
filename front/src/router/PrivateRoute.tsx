import type { JSX } from 'react';
import { useContext } from 'react';
import { Navigate } from 'react-router';
import { UserContext, type Role } from '../context/userContext';

interface Props {
  element: JSX.Element;
  allowedRoles?: Role[];
}

export const PrivateRoute = ({ element, allowedRoles }: Props) => {
  const { authStatus, hasRole } = useContext(UserContext);

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