import { useState } from 'react';
import { videotutorialesMock } from '../data/videotutoriales.mock';
import { VideotutorialViewer } from '../components/videotutorialViewer';
import type { Videotutorial } from '../types/videotutorial.interface';

export const VideotutorialesPage = () => {
  const [selected, setSelected] = useState<Videotutorial>(videotutorialesMock[0]);

  return (
    <>
      {/* Header */}
      <header className="py-5 border-bottom" style={{ background: 'linear-gradient(135deg, #1a1f36 0%, #2d3561 100%)' }}>
        <div className="container py-3">
          <span
            className="badge rounded-pill px-3 py-2 mb-3 d-inline-block"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.75rem', letterSpacing: '0.06em' }}
          >
            CENTRO DE AYUDA
          </span>
          <h1 className="fw-bold text-white mb-2" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>
            Videotutoriales
          </h1>
          <p className="mb-0" style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 520, lineHeight: 1.7 }}>
            Aprende a usar nuestra plataforma con guías visuales paso a paso. Selecciona el tema que necesites en el menú lateral.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main style={{ background: '#f4f6f9', minHeight: 'calc(100vh - 200px)' }}>
        <div className="container py-5">
          <div className="row g-4 align-items-start">

            {/* ── Menú lateral ───────────────────────────────────────── */}
            <div className="col-lg-3 col-md-4">
              <div
                className="rounded-4 overflow-hidden sticky-top"
                style={{
                  top: 80,
                  background: '#fff',
                  boxShadow: '0 2px 12px rgba(0,0,0,.07)',
                  border: '1px solid #e9ecef',
                }}
              >
                <div
                  className="px-4 py-3 border-bottom"
                  style={{ background: '#f8f9fa' }}
                >
                  <span
                    className="fw-semibold small text-uppercase"
                    style={{ letterSpacing: '0.07em', color: '#6c757d' }}
                  >
                    <i className="bi bi-play-circle me-2" />
                    Tutoriales
                  </span>
                </div>

                <ul className="list-unstyled mb-0 py-2">
                  {videotutorialesMock.map((tut) => {
                    const isActive = tut.id === selected.id;
                    return (
                      <li key={tut.id}>
                        <button
                          onClick={() => setSelected(tut)}
                          className="w-100 border-0 text-start px-4 py-3 d-flex align-items-center gap-3"
                          style={{
                            background: isActive
                              ? 'linear-gradient(90deg, rgba(13,110,253,0.1) 0%, rgba(13,110,253,0.04) 100%)'
                              : 'transparent',
                            borderLeft: isActive ? '3px solid #0d6efd' : '3px solid transparent',
                            cursor: 'pointer',
                            transition: 'all .15s',
                            color: isActive ? '#0d6efd' : '#495057',
                          }}
                        >
                          <i
                            className={`bi ${tut.icono ?? 'bi-play-fill'} flex-shrink-0`}
                            style={{ fontSize: '1rem', opacity: isActive ? 1 : 0.55 }}
                          />
                          <span
                            className="small"
                            style={{ fontWeight: isActive ? 600 : 400, lineHeight: 1.4 }}
                          >
                            {tut.titulo}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* ── Contenido del tutorial ──────────────────────────────── */}
            <div className="col-lg-9 col-md-8">
              <div
                className="rounded-4 p-4 p-lg-5"
                style={{
                  background: '#fff',
                  boxShadow: '0 2px 12px rgba(0,0,0,.07)',
                  border: '1px solid #e9ecef',
                }}
              >
                <VideotutorialViewer tutorial={selected} />
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
};