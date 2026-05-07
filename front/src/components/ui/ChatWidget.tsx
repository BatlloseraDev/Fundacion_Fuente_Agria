import { useState, useEffect, useRef, use } from 'react';
import { UserContext } from '../../context/userContext';
import { io, Socket } from 'socket.io-client';

export const ChatWidget = () => {
    const { user, isAuthenticated, hasRole } = use(UserContext);
    const [isOpen, setIsOpen] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [mensajes, setMensajes] = useState<any[]>([]);
    const [chatId, setChatId] = useState<number | null>(null);
    
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isAdminOrEditor = hasRole(['ADMIN', 'EDITOR', 'COLABORADOR']);

    useEffect(() => {
        if (!isAuthenticated || isAdminOrEditor || !user) {
            setMensajes([]);
            setChatId(null);
            return;
        }

        const loadChatAndConnect = async () => {
            const token = localStorage.getItem('jwt_token');
            const apiUrl = import.meta.env.VITE_API_URL;
            
            try {
                const res = await fetch(`${apiUrl}/chats/my-chat`, { headers: { 'Authorization': `Bearer ${token}` } });
                const responseData = await res.json();
                const myChat = responseData.data || responseData; 

                const socketUrl = apiUrl.replace('/api', ''); 
                socketRef.current = io(socketUrl);

                if (myChat && myChat.id) {
                    setChatId(myChat.id);
                    setMensajes(myChat.messages || []);
                    socketRef.current.emit('joinChat', { chatId: myChat.id });
                } else {
                    setChatId(null);
                    setMensajes([]);
                }

                socketRef.current.on('newMessage', (nuevoMensaje) => {
                    setChatId((prevChatId) => (!prevChatId || String(prevChatId) === String(nuevoMensaje.chatId)) ? nuevoMensaje.chatId : prevChatId);
                    setMensajes((prev) => {
                        if (prev.length === 0 || String(prev[0].chatId) === String(nuevoMensaje.chatId) || !prev[0].chatId) {
                            if (!prev.some(m => m.id === nuevoMensaje.id)) return [...prev, nuevoMensaje];
                        }
                        return prev;
                    });
                });

            } catch (error) {
                console.error("Error al cargar el chat:", error);
            }
        };

        loadChatAndConnect();
        return () => { socketRef.current?.disconnect(); };
    }, [isAuthenticated, isAdminOrEditor, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensajes, isOpen]);

    const enviarMensaje = (e: React.FormEvent) => {
        e.preventDefault();
        if (!mensaje.trim() || !socketRef.current || !user) return;

        socketRef.current.emit('sendMessage', { chatId, userId: Number(user.id), message: mensaje });
        setMensaje('');
    };

    if (!isAuthenticated || isAdminOrEditor || !user) return null;

    return (
        <div className="position-fixed bottom-0 end-0 mb-4 me-4 shadow-lg rounded-top z-3" style={{ width: '350px' }}>
            
            <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center rounded-top" role="button" onClick={() => setIsOpen(!isOpen)}>
                <span className="fw-bold d-flex align-items-center gap-2">
                    Chat de soporte
                </span>
                <i className={`bi bi-chevron-${isOpen ? 'down' : 'up'} fw-bold`}></i>
            </div>

            {isOpen && (
                <div className="bg-white d-flex flex-column border border-top-0" style={{ height: '400px' }}>
                    
                    <div className="p-3 flex-grow-1 overflow-auto bg-light">
                        <div className="d-flex flex-column align-items-start mb-3">
                            <span className="bg-white text-dark p-2 rounded-3 shadow-sm small border w-75">
                                ¡Hola! Escríbenos si tienes alguna duda y un administrador te responderá en breve.
                            </span>
                        </div>
                        {mensajes.map((msg, idx) => {
                            const isMine = String(msg.userId || msg.user?.id) === String(user.id);
                            return (
                                <div key={idx} className={`d-flex flex-column mb-2 ${isMine ? 'align-items-end' : 'align-items-start'}`}>
                                    <span className={`p-2 rounded-3 small shadow-sm w-75 ${isMine ? 'bg-primary text-white' : 'bg-white text-dark border'}`}>
                                        {msg.message}
                                    </span>
                                    <small className="text-muted mt-1" style={{ fontSize: '0.70rem' }}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </small>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-2 border-top bg-white">
                        <form onSubmit={enviarMensaje} className="input-group">
                            <input type="text" className="form-control bg-light rounded-start-pill border-end-0" placeholder="Escribe tu mensaje..." value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
                            <button type="submit" className="btn btn-primary rounded-end-pill px-3" disabled={!mensaje.trim()}>
                                <i className="bi bi-send-fill"></i> Enviar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};