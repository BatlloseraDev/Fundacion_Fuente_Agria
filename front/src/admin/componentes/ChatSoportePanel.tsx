import { useEffect, useState, useRef, use } from 'react';
import type { AdminChat, AdminMessage } from '../types/admin.types';
import { getChats, getChatMessages } from '../services/admin.service';
import { UserContext } from '../../context/userContext';
import { io, Socket } from 'socket.io-client';

const AVATAR_COLORS = ['#4361ee','#3a0ca3','#7209b7','#f72585','#4cc9f0','#06d6a0','#118ab2','#ef476f','#ffd166','#073b4c'];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }

export const ChatSoportePanel = () => {
  const { user } = use(UserContext); 
  const [chats, setChats] = useState<AdminChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<AdminChat | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null); 
  const selectedChatIdRef = useRef<number | null>(null);

  useEffect(() => {
    getChats()
      .then((data) => {
        const sortedChats = data.sort((a, b) => {
          const dateA = a.messages?.[0] ? new Date(a.messages[0].createdAt).getTime() : 0;
          const dateB = b.messages?.[0] ? new Date(b.messages[0].createdAt).getTime() : 0;
          return dateB - dateA; 
        });
        setChats(sortedChats);
        if (sortedChats.length > 0) handleSelect(sortedChats[0]);
      })
      .finally(() => setLoading(false));

    const token = localStorage.getItem('jwt_token');
    const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
    
    socketRef.current = io(apiUrl, { extraHeaders: { Authorization: `Bearer ${token}` } });
    socketRef.current.emit('joinAdmins');

    socketRef.current.on('newMessage', (nuevoMensaje: any) => {
      if (String(nuevoMensaje.chatId) === String(selectedChatIdRef.current)) {
        setMessages((prev) => [...prev, nuevoMensaje]);
      }
      
      setChats(currentChats => {
        const chatToUpdate = currentChats.find(c => String(c.id) === String(nuevoMensaje.chatId));
        if (chatToUpdate) {
            const otherChats = currentChats.filter(c => String(c.id) !== String(nuevoMensaje.chatId));
            return [{ ...chatToUpdate, messages: [nuevoMensaje] }, ...otherChats];
        } else {
            return [{ id: nuevoMensaje.chatId, user: nuevoMensaje.user, messages: [nuevoMensaje] }, ...currentChats];
        }
      });
    });

    return () => { socketRef.current?.disconnect(); };
  }, []);

  const handleSelect = async (chat: AdminChat) => {
    setSelectedChat(chat);
    selectedChatIdRef.current = chat.id;
    setLoadingMessages(true);
    try { 
        setMessages(await getChatMessages(chat.id)); 
        socketRef.current?.emit('joinChat', { chatId: chat.id });
    }
    catch { setMessages([]); }
    finally { setLoadingMessages(false); }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const adminSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedChat || !user) return;

    socketRef.current?.emit('sendMessage', {
      chatId: selectedChat.id,
      userId: Number(user.id),
      message: inputText
    });
    
    setInputText('');
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="container-fluid px-0">
      <div className="mb-4">
        <h5 className="fw-bold mb-1">Chat de soporte</h5>
      </div>

      <div className="row g-0 rounded-4 shadow-sm border bg-white overflow-hidden" style={{ height: '650px' }}>
        
        <div className="col-12 col-md-4 col-lg-3 bg-dark d-flex flex-column h-100">
          <div className="p-3 text-white-50 fw-semibold small text-uppercase border-bottom border-secondary">
            Conversaciones
          </div>
          <div className="list-group list-group-flush overflow-auto flex-grow-1">
            {chats.map((chat) => {
              const isSelected = selectedChat?.id === chat.id;
              const lastMsg = chat.messages?.[0];
              return (
                <button 
                  key={chat.id} 
                  onClick={() => handleSelect(chat)} 
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-3 p-3 border-bottom border-secondary ${isSelected ? 'active bg-primary border-primary' : 'bg-dark text-white'}`}
                >
                  <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0 bg-light text-dark shadow-sm" style={{ width: '42px', height: '42px' }}>
                    {chat.user?.avatarUrl ? <img src={chat.user.avatarUrl} alt="" className="rounded-circle w-100 h-100 object-fit-cover" /> : chat.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden flex-grow-1 text-start">
                    <div className="fw-semibold text-truncate">{chat.user?.name} {chat.user?.subname}</div>
                    <div className={`text-truncate small ${isSelected ? 'text-white-50' : 'text-secondary'}`}>
                      {lastMsg ? lastMsg.message : 'Sin mensajes'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="col-12 col-md-8 col-lg-9 bg-light d-flex flex-column h-100">
          {selectedChat ? (
            <>
              <div className="p-3 d-flex align-items-center gap-3 border-bottom bg-white shadow-sm z-1">
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm" style={{ width: '45px', height: '45px', background: avatarColor(selectedChat.user?.id || 0) }}>
                  {selectedChat.user?.avatarUrl ? <img src={selectedChat.user.avatarUrl} alt="" className="rounded-circle w-100 h-100 object-fit-cover" /> : selectedChat.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="fw-bold fs-6 text-dark">{selectedChat.user?.name} {selectedChat.user?.subname}</div>
                  <div className="text-muted small">{selectedChat.user?.email}</div>
                </div>
              </div>

              <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-3" ref={chatContainerRef}>
                {loadingMessages ? (
                  <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted mt-5">
                    <i className="bi bi-chat-dots d-block mb-2 text-muted opacity-50" style={{ fontSize: '3rem' }} />
                    Sin historial de mensajes
                  </div>
                ) : messages.map((msg) => {
                  const isOwn = String(msg.user?.id) === String(user?.id);
                  return (
                    <div key={msg.id} className={`d-flex ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}>
                      <div className={`rounded-4 px-3 py-2 shadow-sm w-75 ${isOwn ? 'bg-primary text-white' : 'bg-white text-dark border'}`}>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</div>
                        <div className={`text-end mt-1 small ${isOwn ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.70rem' }}>
                          {new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 border-top bg-white">
                <form onSubmit={adminSendMessage} className="input-group">
                  <input type="text" className="form-control bg-light rounded-start-pill border-end-0 py-2 px-3" placeholder="Escribe tu respuesta..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
                  <button type="submit" className="btn btn-primary rounded-end-pill px-4 fw-semibold" disabled={!inputText.trim()}>
                    <i className="bi bi-send-fill me-2"></i> Enviar
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted">
              <i className="bi bi-chat-left-dots mb-3 text-muted opacity-25" style={{ fontSize: '4rem' }} />
              <span className="fs-5 fw-semibold">Selecciona un chat en la lista</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
