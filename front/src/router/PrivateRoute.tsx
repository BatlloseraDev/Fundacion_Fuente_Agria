import {use, type JSX } from "react";
import { UserContext } from "../context/userContext";
import type { Role } from "../context/types/user.types";
import { Navigate } from "react-router";


interface Props{
    element: JSX.Element;
    allowedRoles?: Role[];

}


export const PrivateRoute = ({element, allowedRoles}: Props)=>{
    const {authStatus, hasRole} = use(UserContext);

    if(authStatus === 'checking'){
        
        return <div className="text-center mt-5">Cargando...</div>
    }

    //si no está autenticado, pal' login
    if(authStatus === 'not-authenticated'){
        return <Navigate to="/login" replace/>
    }

    //Y esto es en el caso de que requiera de unos roles que no tiene
    if(allowedRoles && !hasRole(allowedRoles)){
        return <Navigate to="/" replace/> //deberíamos de crear una ventana de "Sin permisos"
    }

    return element
}