import { useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { AdminReservation, ReservationStatus } from '../types/admin.types';
import { cancelReservation, collectReservation, getReservations } from '../services/admin.service';

const STATUS_CONFIG: Record<ReservationStatus, { label: string; color: string; bg: string; icon: string }> = {
  RESERVED: { label: 'Pendiente', color: '#92400e', bg: '#fef3c7', icon: 'bi-hourglass-split' },
  CANCELLED: { label: 'Cancelada', color: '#7f1d1d', bg: '#fee2e2', icon: 'bi-x-circle-fill' },
  COLLECTED: { label: 'Entregada', color: '#065f46', bg: '#d1fae5', icon: 'bi-check-circle-fill' },
};

const FILTER_OPTIONS: { value: ReservationStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'RESERVED', label: 'Pendientes' },
  { value: 'COLLECTED', label: 'Entregadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
];

const currency = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '-';

const StatusBadge = ({ status }: { status: ReservationStatus }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.RESERVED;
  return (
    <span
      className="badge rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1"
      style={{ background: cfg.bg, color: cfg.color, fontSize: '0.75rem' }}
    >
      <i className={`bi ${cfg.icon}`} style={{ fontSize: '0.7rem' }} />
      {cfg.label}
    </span>
  );
};

export const ReservasPanel = () => {
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<ReservationStatus | 'ALL'>('ALL');
  const [newCount, setNewCount] = useState(0);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    getReservations()
      .then(setReservations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    const socket: Socket = io(import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL?.replace('/api', '') ?? '', {
      transports: ['websocket'],
    });
    socketRef.current = socket;
    socket.emit('joinReservations');

    socket.on('newReservation', (reservation: AdminReservation) => {
      setReservations((prev) => [reservation, ...prev.filter((item) => item.id !== reservation.id)]);
      setNewCount((count) => count + 1);
    });

    socket.on('reservationUpdated', (reservation: AdminReservation) => {
      setReservations((prev) => prev.map((item) => (item.id === reservation.id ? reservation : item)));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filtered = useMemo(() => {
    const filteredReservations =
      filter === 'ALL'
        ? reservations
        : reservations.filter((reservation) => reservation.status === filter);

    return [...filteredReservations].sort((a, b) => {
      const aIsOpen = a.status === 'RESERVED';
      const bIsOpen = b.status === 'RESERVED';

      if (filter === 'ALL' && aIsOpen !== bIsOpen) {
        return aIsOpen ? -1 : 1;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filter, reservations]);

  const handleStatusAction = async (reservation: AdminReservation, action: 'cancel' | 'collect') => {
    setWorkingId(reservation.id);
    setError('');
    try {
      const updated = action === 'cancel'
        ? await cancelReservation(reservation.id)
        : await collectReservation(reservation.id);
      setReservations((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setWorkingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" style={{ color: '#1a1f36' }} /></div>;
  }

  return (
    <div onClick={() => setNewCount(0)}>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <div className="fw-bold fs-5 d-flex align-items-center gap-2">
            Reservas
            {newCount > 0 && (
              <span className="badge rounded-pill" style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem' }}>
                {newCount} nueva{newCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="text-muted small">{reservations.length} en total</div>
        </div>

        <div className="d-flex gap-1 flex-wrap">
          {FILTER_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              className="btn btn-sm rounded-pill px-3"
              style={{
                background: filter === value ? '#1a1f36' : 'transparent',
                color: filter === value ? '#fff' : '#6c757d',
                border: `1px solid ${filter === value ? '#1a1f36' : '#dee2e6'}`,
                fontSize: '0.8rem',
              }}
              onClick={() => setFilter(value)}
            >
              {label}
              {value !== 'ALL' && (
                <span className="ms-1 opacity-75">
                  ({reservations.filter((item) => item.status === value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-danger rounded-3">{error}</div>}

      {filtered.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-3" style={{ fontSize: '3rem', opacity: .25 }}><i className="bi bi-bag-check" /></div>
          <div className="fw-semibold text-muted">
            {filter === 'ALL' ? 'Sin reservas todavia' : 'No hay reservas en este estado'}
          </div>
          <div className="text-muted small mt-1">Cuando alguien reserve productos aparecera aqui en tiempo real</div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 6px' }}>
            <thead>
              <tr className="small text-muted text-uppercase" style={{ letterSpacing: '.05em', fontSize: '0.72rem' }}>
                <th className="border-0 pb-2 ps-0">Reserva</th>
                <th className="border-0 pb-2">Persona</th>
                <th className="border-0 pb-2">Productos</th>
                <th className="border-0 pb-2">Recogida</th>
                <th className="border-0 pb-2">Estado</th>
                <th className="border-0 pb-2 text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reservation) => {
                const isOpen = reservation.status === 'RESERVED';
                return (
                <tr
                  key={reservation.id}
                  style={{
                    background: isOpen ? '#fff' : '#f8f9fa',
                    boxShadow: isOpen ? '0 1px 3px rgba(0,0,0,.06)' : 'none',
                    opacity: isOpen ? 1 : 0.72,
                  }}
                >
                  <td className="border-0 py-3 ps-0">
                    <div className="fw-semibold">{reservation.ticketCode}</div>
                    <div className="text-muted small">Reservado el {formatDate(reservation.createdAt)}</div>
                    <div className="small fw-semibold mt-1">{currency.format(Number(reservation.total ?? 0))}</div>
                  </td>
                  <td className="border-0">
                    <div className="small fw-medium">{reservation.user.name} {reservation.user.subname}</div>
                    <div className="small text-muted">{reservation.user.email}</div>
                  </td>
                  <td className="border-0">
                    <div className="small" style={{ maxWidth: 260 }}>
                      {reservation.articles.map((item) => (
                        <div key={item.id} className="d-flex justify-content-between gap-3">
                          <span className="text-truncate">{item.article?.name ?? 'Producto'}</span>
                          <span className="text-muted flex-shrink-0">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="border-0">
                    <div className="small fw-medium">{formatDate(reservation.reservationExpiresAt)}</div>
                    <div className="small text-muted">
                      {reservation.status === 'RESERVED'
                        ? `${reservation.daysRemaining ?? 0} dia${reservation.daysRemaining === 1 ? '' : 's'} restante${reservation.daysRemaining === 1 ? '' : 's'}`
                        : 'Cerrada'}
                    </div>
                  </td>
                  <td className="border-0">
                    <StatusBadge status={reservation.status} />
                  </td>
                  <td className="border-0 text-end">
                    {isOpen ? (
                      <div className="d-flex justify-content-end gap-2 flex-wrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-pill px-3"
                          disabled={workingId === reservation.id}
                          onClick={() => handleStatusAction(reservation, 'cancel')}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-success rounded-pill px-3"
                          disabled={workingId === reservation.id}
                          onClick={() => handleStatusAction(reservation, 'collect')}
                        >
                          Entregado
                        </button>
                      </div>
                    ) : (
                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          background: reservation.status === 'COLLECTED' ? '#e5e7eb' : '#fee2e2',
                          color: reservation.status === 'COLLECTED' ? '#374151' : '#7f1d1d',
                          fontSize: '0.78rem',
                        }}
                      >
                        {reservation.status === 'COLLECTED' ? 'Entregado' : 'Cancelada'}
                      </span>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
