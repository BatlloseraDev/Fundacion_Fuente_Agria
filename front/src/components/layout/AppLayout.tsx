import { Outlet } from 'react-router';
import { Header } from '../ui/Header';
import { Footer } from '../ui/Footer';
import { EditorBar } from '../ui/EditorBar';
import { EditorContextProvider } from '../../context/editorContextProvider';
import { FloatingChat } from '../chat/FloatingChat';

export function AppLayout() {
    return (
      
        <EditorContextProvider>
            <div className="d-flex flex-column min-vh-100">
                <EditorBar />
                <Header />
                <main className="flex-grow-1">
                    <Outlet />
                </main>
                <Footer />
                <FloatingChat />
            </div>
        </EditorContextProvider>
    );
}