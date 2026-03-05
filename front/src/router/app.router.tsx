import {createBrowserRouter, Navigate, useNavigate} from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import InicioPage from "../inicio/pages/InicioPage";
import { CatalogoPage } from "../catalogo/pages/CatalogoPage";
import EncargosPage from "../encargos/pages/EncargosPage";
import { ActividadesPage } from "../actividades/pages/ActividadesPage";
import { ActividadDetailPage } from "../actividades/pages/ActividadDetailPage";
import { PrivateRoute } from "./PrivateRoute";


// =========================================================
// COMPONENTE MOCK PARA TESTEAR EL LOGIN RÁPIDAMENTE (HAY QUE HACER UN COMPONENTE SOLO HE HECHO ESTO PARA TESTEAR SI FUNCIONA SIN PISAR TRABAJO)
// =========================================================
import { use } from 'react';
import { UserContext } from '../context/userContext';


const MockLoginPage = () => {
  const { login } = use(UserContext);
  const navigate = useNavigate();

  const handleSimulateLogin = () => {
    // Al llamar a login(), nuestro UserContext guardará un usuario falso 
    // y cambiará el estado a 'authenticated'
    login('fake_jwt_token_12345'); 
    navigate('/');
    // Redirigimos a una ruta protegida para comprobar que funciona
    // navigate('/admin/dashboard'); 
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Página de Login (Simulación)</h1>
      <p>Haz clic en el botón para simular que recibes un JWT del backend e inicias sesión.</p>
      <button 
        onClick={handleSimulateLogin} 
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        Iniciar Sesión Falsa
      </button>
    </div>
  );
};
// =========================================================



export const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout/>,//esto es lo que hace que se envuelva todo con el header y footer
        children: [
            {path: '/', element: <InicioPage/>},
            {path: '/catalogo', element: <CatalogoPage/>},
            {path: '/encargos', element: <EncargosPage/>},
            {path: '/actividades', element: <ActividadesPage/>},
            {path: '/actividades/:id', element: <ActividadDetailPage/>},
            // Ejemplo de una ruta solo para los usuarios que hayan sido loggeados
            { 
                path: '/perfil', 
                element: <PrivateRoute element={<div>Página de Perfil (Solo Login)</div>} /> 
            },

            // Ejemplo de ruta protegida por Roles (Solo Admins o Editores) y dentro de este tendriamos que cargar distintios elementos en fucion del rol
            { 
                path: '/admin/dashboard', 
                element: <PrivateRoute element={<div>Panel de Administración</div>} allowedRoles={['admin', 'editor']} /> 
            },//SOLO ES UN EJEMPLO AQUI NO VA ADMIN 
            

            { path: '*', element: <Navigate to='/' /> }
        ]
    },
    // Si hubiera una ruta que no deba llevar header ni footer (ej: un Login puro), la ponemos aquí afuera como tambien el panel de admin.... etc
    // { path: '/login', element: <LoginPage /> }
    { 
        path: '/login', 
        element: <MockLoginPage /> 
    }
]);