import { useEffect, useState } from 'react';
import type { AdminChat, AdminMessage } from '../types/admin.types';
import { getChats, getChatMessages } from '../services/admin.service';

const AVATAR_COLORS = [
  '#4361ee','#3a0ca3','#7209b7','#f72585','#4cc9f0',
  '#06d6a0','#118ab2','#ef476f','#ffd166','#073b4c',
];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }

export const ChatSoportePanel = () => {
  const [chats, setChats] = useState<AdminChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChat, setSelectedChat] = useState<AdminChat | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    getChats()
      .then((data) => {
        setChats(data);
        if (data.length > 0) handleSelect(data[0]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (chat: AdminChat) => {
    setSelectedChat(chat);
    setLoadingMessages(true);
    try { setMessages(await getChatMessages(chat.id)); }
    catch { setMessages([]); }
    finally { setLoadingMessages(false); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: '#1a1f36' }} /></div>;
  if (error) return <div className="alert alert-danger rounded-3">{error}</div>;

  if (chats.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-3" style={{ fontSize: '3rem', opacity: .25 }}><i className="bi bi-chat-dots" /></div>
        <div className="fw-semibold text-muted">Sin conversaciones todavía</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <div className="fw-bold fs-5">Chat soporte</div>
        <div className="text-muted small">{chats.length} conversaciones</div>
      </div>

      <div
        className="rounded-4 overflow-hidden"
        style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 500, boxShadow: '0 2px 12px rgba(0,0,0,.08)' }}
      >
        {/* ── Lista de chats ─────────────────────────────────────── */}
        <div style={{ background: '#1a1f36', overflowY: 'auto' }}>
          <div className="px-3 pt-3 pb-2">
            <div className="text-white fw-semibold small text-uppercase" style={{ letterSpacing: '.08em', opacity: .6 }}>Conversaciones</div>
          </div>
          {chats.map((chat) => {
            const isSelected = selectedChat?.id === chat.id;
            const lastMsg = chat.messages[0];
            const color = avatarColor(chat.user.id);
            return (
              <button
                key={chat.id}
                onClick={() => handleSelect(chat)}
                className="w-100 border-0 text-start px-3 py-3 d-flex align-items-center gap-3"
                style={{
                  background: isSelected ? 'rgba(255,255,255,0.12)' : 'transparent',
                  borderLeft: isSelected ? '3px solid #4cc9f0' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'background .15s',
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold text-white"
                  style={{ width: 38, height: 38, fontSize: 13, background: color }}
                >
                  {chat.user.avatarUrl
                    ? <img src={chat.user.avatarUrl} alt="" className="rounded-circle" style={{ width: 38, height: 38, objectFit: 'cover' }} />
                    : chat.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden flex-grow-1">
                  <div className="small fw-semibold text-truncate" style={{ color: '#fff' }}>
                    {chat.user.name} {chat.user.subname}
                  </div>
                  <div className="text-truncate" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                    {lastMsg ? lastMsg.message : 'Sin mensajes'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Conversación ───────────────────────────────────────── */}
        <div style={{ background: '#f8f9fb', display: 'flex', flexDirection: 'column' }}>
          {selectedChat ? (
            <>
              {/* Cabecera */}
              <div className="px-4 py-3 d-flex align-items-center gap-3 border-bottom" style={{ background: '#fff' }}>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold text-white"
                  style={{ width: 40, height: 40, fontSize: 14, background: avatarColor(selectedChat.user.id) }}
                >
                  {selectedChat.user.avatarUrl
                    ? <img src={selectedChat.user.avatarUrl} alt="" className="rounded-circle" style={{ width: 40, height: 40, objectFit: 'cover' }} />
                    : selectedChat.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="fw-semibold">{selectedChat.user.name} {selectedChat.user.subname}</div>
                  <div className="text-muted" style={{ fontSize: '0.78rem' }}>{selectedChat.user.email}</div>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-3" style={{ maxHeight: 420 }}>
                {loadingMessages ? (
                  <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-secondary" /></div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted small mt-4">
                    <i className="bi bi-chat d-block mb-2" style={{ fontSize: '2rem', opacity: .3 }} />
                    Sin mensajes en esta conversación
                  </div>
                ) : messages.map((msg) => {
                  const isOwn = msg.user.id === selectedChat.user.id;
                  return (
                    <div key={msg.id} className={`d-flex ${isOwn ? 'justify-content-start' : 'justify-content-end'}`}>
                      {isOwn && (
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white fw-bold me-2"
                          style={{ width: 30, height: 30, fontSize: 11, background: avatarColor(msg.user.id), alignSelf: 'flex-end' }}
                        >
                          {msg.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div
                        className="rounded-4 px-3 py-2 small"
                        style={{
                          maxWidth: '70%',
                          background: isOwn ? '#fff' : '#1a1f36',
                          color: isOwn ? '#212529' : '#fff',
                          boxShadow: '0 1px 3px rgba(0,0,0,.08)',
                          borderBottomLeftRadius: isOwn ? '4px' : undefined,
                          borderBottomRightRadius: isOwn ? undefined : '4px',
                        }}
                      >
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</div>
                        <div className="text-end mt-1" style={{ fontSize: '0.68rem', opacity: .55 }}>
                          {new Date(msg.createdAt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted gap-2">
              <i className="bi bi-chat-dots" style={{ fontSize: '2.5rem', opacity: .25 }} />
              <span className="small">Selecciona una conversación</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
