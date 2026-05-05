import type { Videotutorial } from '../types/videotutorial.interface';

interface Props {
  tutorial: Videotutorial;
}

export const VideotutorialViewer = ({ tutorial }: Props) => {
  return (
    <div className="h-100 d-flex flex-column">
      {/* Título */}
      <div className="mb-4">
        <h1 className="fw-bold mb-1" style={{ fontSize: '1.6rem', color: '#1a1f36', lineHeight: 1.3 }}>
          {tutorial.titulo}
        </h1>
        <div style={{ width: 48, height: 4, background: '#0d6efd', borderRadius: 2 }} />
      </div>

      {/* Vídeo embebido */}
      <div
        className="rounded-4 overflow-hidden mb-4 shadow-sm"
        style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${tutorial.videoId}`}
          title={tutorial.titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </div>

      {/* Descripción */}
      <p className="text-secondary mb-4" style={{ lineHeight: 1.75, fontSize: '0.98rem' }}>
        {tutorial.descripcion}
      </p>

      {/* Pasos */}
      <div>
        <h2 className="fw-semibold mb-3" style={{ fontSize: '1rem', color: '#1a1f36', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <i className="bi bi-list-check me-2 text-primary" />
          Pasos a seguir
        </h2>
        <ol className="list-unstyled d-flex flex-column gap-3 mb-0">
          {tutorial.pasos.map((paso, i) => (
            <li key={i} className="d-flex align-items-start gap-3">
              <span
                className="flex-shrink-0 d-flex align-items-center justify-content-center fw-bold text-white rounded-circle"
                style={{
                  width: 32,
                  height: 32,
                  fontSize: '0.8rem',
                  background: 'linear-gradient(135deg, #0d6efd 0%, #2d3561 100%)',
                  marginTop: 2,
                }}
              >
                {i + 1}
              </span>
              <span className="text-secondary" style={{ lineHeight: 1.65, fontSize: '0.95rem' }}>
                {paso}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};