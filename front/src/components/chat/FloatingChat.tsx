import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
      const socket = io(backendUrl);
      socketRef.current = socket;

      socket.on('messageChunk', (data: { text: string }) => {
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = newMessages.length > 0 ? newMessages[newMessages.length - 1] : null;
          
          if (lastMsg && lastMsg.sender === 'bot') {
            // Append to the current bot message
            newMessages[newMessages.length - 1] = {
              ...lastMsg,
              text: lastMsg.text + data.text
            };
          } else {
            // Start a new bot message
            newMessages.push({
              id: Date.now().toString(),
              text: data.text,
              sender: 'bot'
            });
          }
          return newMessages;
        });
      });

      
      socket.on('receiveMessage', () => {});

      socket.on('typing', (typing: boolean) => {
        setIsTyping(typing);
      });

      return () => {
        socket.disconnect();
      };
    } else {
      // Limpiar sesión efímera
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setMessages([]);
    }
  }, [isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;

    const newMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, newMsg]);
    
    socketRef.current.emit('sendBotMessage', { text: input });
    setInput('');
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1050 }}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-primary rounded-circle shadow d-flex align-items-center justify-content-center"
          style={{ width: '60px', height: '60px' }}
        >
          <i className="bi bi-robot fs-3"></i>
        </button>
      )}

      {isOpen && (
        <div className="card shadow" style={{ width: '350px', height: '500px', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fs-6">Asistente Virtual FFA</h5>
            <button
              onClick={() => setIsOpen(false)}
              className="btn-close btn-close-white"
              aria-label="Close"
            ></button>
          </div>
          
          <div className="card-body overflow-auto flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
            {messages.length === 0 && (
              <div className="text-center text-muted mt-3">
                <small>¡Hola! Soy el asistente de la Fundación. ¿En qué puedo ayudarte hoy? (ten en cuenta que soy una IA, puedo cometer errores)</small>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  className={`p-2 rounded ${
                    msg.sender === 'user' ? 'bg-primary text-white' : 'bg-light border'
                  }`}
                  style={{ maxWidth: '80%' }}
                >
                  <small style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</small>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="d-flex mb-3 justify-content-start">
                <div className="p-2 rounded bg-light border text-muted">
                  <small>Escribiendo...</small>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="card-footer bg-white">
            <form onSubmit={handleSend} className="d-flex">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Escribe tu mensaje..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={!input.trim()}>
                <i className="bi bi-send-fill"></i>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
