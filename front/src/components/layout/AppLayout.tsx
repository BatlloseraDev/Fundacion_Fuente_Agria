import { Outlet } from "react-router";
import { Header } from "../ui/Header";
import { Footer } from "../ui/Footer";
import { use } from "react";
import { UserContext } from "../../context/userContext";

export const AppLayout = () =>{
    //antes tenia hardcodeado los permissos en el footer
    const {hasRole} = use(UserContext);

    return(
        <div className='d-flex flex-column min-vh-100'>
            <Header/>
            <div className="flex-grow-1 container-fluid px-0" style={{ minHeight: '60vh' }}>
                <Outlet/>{/*AQUI SE INYECTAN LAS PAGINAS EN EL NUEVO ROUTER QUE HE IMPLEMENTADO */}
            </div>
            <Footer 
                editorToken={hasRole(['EDITOR','ADMIN'])}
                adminToken={hasRole(['ADMIN'])}
            />
        </div>
    )
    
}