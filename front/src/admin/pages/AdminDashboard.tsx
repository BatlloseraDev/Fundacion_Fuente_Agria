import { useState } from 'react';
import { ColaboradoresPanel } from '../componentes/ColaboradoresPanel';
import { EditoresPanel } from '../componentes/EditoresPanel';
import { ActividadesPanel } from '../componentes/ActividadesPanel';
import { ChatSoportePanel } from '../componentes/ChatSoportePanel';
import { EncargosPanel } from '../componentes/EncargosPanel';
import { ReservasPanel } from '../componentes/ReservasPanel';

type Tab = 'colaboradores' | 'editores' | 'actividades' | 'encargos' | 'reservas' | 'chat-soporte' | 'chat-ventas' | 'pie-pagina';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'colaboradores', label: 'Colaboradores',  icon: 'bi-people-fill'            },
  { id: 'editores',      label: 'Usuarios',       icon: 'bi-person-badge-fill'      },
  { id: 'actividades',   label: 'Actividades',    icon: 'bi-calendar-event-fill'    },
  { id: 'encargos',      label: 'Encargos',       icon: 'bi-clipboard2-check-fill'  },
  { id: 'reservas',      label: 'Reservas',       icon: 'bi-bag-check-fill'         },
  { id: 'chat-soporte',  label: 'Chat soporte',   icon: 'bi-chat-dots-fill'         },
  { id: 'chat-ventas',   label: 'Chat ventas',    icon: 'bi-bag-heart-fill'         },
  { id: 'pie-pagina',    label: 'Pie de página',  icon: 'bi-layout-text-window'     },
];

const ProximamentePanel = ({ label }: { label: string }) => (
  <div className="text-center py-5">
    <div className="mb-3" style={{ fontSize: '3rem', opacity: .2 }}>
      <i className="bi bi-tools" />
    </div>
    <div className="fw-semibold text-muted">{label}</div>
    <div className="text-muted small mt-1">Esta sección está en desarrollo</div>
  </div>
);

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('colaboradores');

  return (
    <div style={{ background: '#f4f6f9', minHeight: '100vh' }}>

      {/* ── Hero header ─────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #1a1f36 0%, #2d3561 100%)', padding: '2rem 0 0' }}>
        <div className="container">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.15)' }}
            >
              <i className="bi bi-shield-lock-fill text-white fs-5" />
            </div>
            <div>
              <h1 className="text-white fw-bold mb-0" style={{ fontSize: '1.5rem' }}>
                Panel de administración
              </h1>
              <p className="mb-0" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                Fundación Fuente Agria
              </p>
            </div>
          </div>

          {/* Pestañas */}
          <div className="d-flex gap-1 overflow-auto pb-0" style={{ scrollbarWidth: 'none' }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="border-0 d-flex align-items-center gap-2 px-4 py-3 flex-shrink-0"
                  style={{
                    background: isActive ? '#f4f6f9' : 'transparent',
                    color: isActive ? '#1a1f36' : 'rgba(255,255,255,0.7)',
                    borderRadius: '10px 10px 0 0',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  <i className={`bi ${tab.icon}`} style={{ fontSize: '1rem' }} />
                  <span className="d-none d-sm-inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────────────── */}
      <div className="container py-4">
        <div
          className="rounded-3 p-4"
          style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.04)' }}
        >
          {activeTab === 'colaboradores' && <ColaboradoresPanel />}
          {activeTab === 'editores'      && <EditoresPanel />}
          {activeTab === 'actividades'   && <ActividadesPanel />}
          {activeTab === 'encargos'      && <EncargosPanel />}
          {activeTab === 'reservas'      && <ReservasPanel />}
          {activeTab === 'chat-soporte'  && <ChatSoportePanel />}
          {activeTab === 'chat-ventas'   && <ProximamentePanel label="Chat ventas" />}
          {activeTab === 'pie-pagina'    && <ProximamentePanel label="Pie de página" />}
        </div>
      </div>
    </div>
  );
};
