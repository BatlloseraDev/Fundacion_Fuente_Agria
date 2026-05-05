import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout';

import InicioPage from '../inicio/pages/InicioPage';
import {CatalogoPage} from "../catalogo/pages/CatalogoPage";
import EncargosPage from '../encargos/pages/EncargosPage';
import { ActividadesPage } from '../actividades/pages/ActividadesPage';
import { ActividadDetailPage } from '../actividades/pages/ActividadDetailPage';
import { AdminDashboard } from '../admin/pages/AdminDashboard';
import {VideotutorialesPage} from "../videotutoriales/pages/videotutorialesPage";

import { PrivateRoute } from './PrivateRoute';

import { LoginPage } from '../login/pages/LoginPage';
import { RegisterPage } from '../login/pages/RegisterPage';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: '/', element: <InicioPage /> },

      { path: '/auth', element: <Navigate to="/register" replace /> },
      //{ path: '/register', element: <RegisterPage /> },
      //{ path: '/login', element: <LoginPage /> },
      { path: '/inicio', element: <InicioPage /> },
      { path: '/catalogo', element: <CatalogoPage /> },
      { path: '/encargos', element: <EncargosPage /> },
      { path: '/actividades', element: <ActividadesPage /> },
      { path: '/actividades/:id', element: <ActividadDetailPage /> },
      { path: '/videotutoriales', element: <VideotutorialesPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        path: '/perfil',
        element: <PrivateRoute element={<div>Pagina de Perfil (Solo Login)</div>} />,
      },
      {
        path: '/admin',
        element: (
          <PrivateRoute
            element={<AdminDashboard />}
            allowedRoles={['ADMIN']}
          />
        ),
      },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },

]);