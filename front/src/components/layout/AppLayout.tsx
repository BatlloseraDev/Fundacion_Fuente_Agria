import { Outlet } from "react-router";
import { Header } from "../ui/Header";
import { Footer } from "../ui/Footer";
import { use } from "react";
import { UserContext } from "../../context/userContext";
import { EditorContext } from "../../context/editorContext";
import { EditorBar } from "../ui/EditorBar";

export const AppLayout = () =>{
    const { hasRole } = use(UserContext);
    const { modoEditor } = use(EditorContext);

    return(
        <div className='d-flex flex-column min-vh-100'>
            {modoEditor && <EditorBar />}
            <Header/>
            <div className="flex-grow-1 container-fluid px-0" style={{ minHeight: '60vh' }}>
                <Outlet/>
            </div>
            <Footer 
                editorToken={hasRole(['editor'])}
                adminToken={hasRole(['admin'])}
            />
        </div>
    )
}