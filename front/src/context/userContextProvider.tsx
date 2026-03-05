import {  useEffect, useState, type PropsWithChildren } from "react";
import {jwtDecode} from 'jwt-decode'
import type{Role,User, AuthStatus} from './types/user.types'
import { UserContext } from "./userContext";



export const UserContextProvider = ({children}: PropsWithChildren) => {
    const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
    const [user, setUser] = useState<User | null>(null);

    const handleLogin = (token: string) =>{
        try{
            //Esta es la lógica real, tenemos que descomentarla despues,
            //ya que voy a tirar de un mock para probar que funcione
            // const decodedToken: any = jwtDecode(token);
            // const loggedUser: User = {
            //     id: decodedToken.sub,
            //     username: decodedToken.username, //si creamos el token con username si no lo tenemos que cambiar
            //     roles: decodedToken.roles
            // }

            //Mock provisional para testear
            const loggedUser: User = {
                id: '1',
                username: 'User De Prueba',
                roles: ['admin', 'editor', 'user'] //  roles: ['admin', 'editor', 'user']
            }

            setUser(loggedUser);
            setAuthStatus('authenticated');
            localStorage.setItem('jwt_token', token);                
        }catch(error){
            console.log(error);//si surge un error lo pinto y por defecto le hago logout por si acasos
            handleLogout();
        }
    }

    const handleLogout = () =>{
        setUser(null);
        setAuthStatus('not-authenticated');
        localStorage.removeItem('jwt_token');
    }

    const hasRole = (allowedRoles: Role[]) => {
        //console.log("Usuario: ", user);
        if(!user){
            return false;
        }
        return allowedRoles.some(role => user.roles.includes(role));
    }

    useEffect(() =>{
        const token = localStorage.getItem('jwt_token');
        if(token){
            handleLogin(token);
        }else{
            handleLogout(); 
        }
    }, []);


    return (
        <UserContext value ={{
            authStatus,
            user,
            isAuthenticated: authStatus === 'authenticated',
            login: handleLogin,
            logout: handleLogout,
            hasRole
        }}>
            {children}
        </UserContext>
    );

};