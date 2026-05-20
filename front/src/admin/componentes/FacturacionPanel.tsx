import { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AdminUser, BillingOrder, BillingPurchase, UserBilling } from '../types/admin.types';
import { getAllUsers, getUserBilling } from '../services/admin.service';

// ── helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

const fmtDateLong = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

const ORDER_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:     { label: 'Pendiente',   color: '#92400e', bg: '#fef3c7' },
  IN_PROGRESS: { label: 'En proceso',  color: '#1e40af', bg: '#dbeafe' },
  COMPLETED:   { label: 'Completado',  color: '#065f46', bg: '#d1fae5' },
  CANCELLED:   { label: 'Cancelado',   color: '#7f1d1d', bg: '#fee2e2' },
};

const PURCHASE_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  RESERVED:   { label: 'Reservado',  color: '#1e40af', bg: '#dbeafe' },
  COLLECTED:  { label: 'Recogido',   color: '#065f46', bg: '#d1fae5' },
  CANCELLED:  { label: 'Cancelado',  color: '#7f1d1d', bg: '#fee2e2' },
};

const Badge = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
  <span
    className="badge rounded-pill px-2 py-1"
    style={{ background: bg, color, fontSize: '0.72rem', fontWeight: 600 }}
  >
    {label}
  </span>
);

// ── PDF generation ────────────────────────────────────────────────────────────

function generateInvoicePdf(
  billing: UserBilling,
  orders: BillingOrder[],
  purchases: BillingPurchase[],
) {
  const { user } = billing;
  const ordersTotal  = orders.reduce((s, o) => s + (o.price ?? 0), 0);
  const purchasesTotal = purchases.reduce((s, p) => s + p.total, 0);
  const grandTotal   = ordersTotal + purchasesTotal;

  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW  = doc.internal.pageSize.getWidth();
  const margin = 18;
  const col2   = pageW / 2 + 5;
  const DARK   : [number, number, number] = [26, 31, 54];
  const GRAY   : [number, number, number] = [100, 100, 110];
  const WHITE  : [number, number, number] = [255, 255, 255];
  const LIGHT  : [number, number, number] = [245, 246, 250];

  let y = margin;

  // ── Cabecera ──────────────────────────────────────────────────────────────
  // Bloque azul oscuro de cabecera
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageW, 28, 'F');

  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('FUNDACIÓN FUENTE AGRIA', margin, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Asociación sin ánimo de lucro · Puertollano, Ciudad Real', margin, 19);

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA', pageW - margin, 12, { align: 'right' });

  const today = new Date();
  const invoiceNum = `FA-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${user.id}`;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº ${invoiceNum}`, pageW - margin, 19, { align: 'right' });
  doc.text(`Fecha: ${fmtDateLong(today.toISOString())}`, pageW - margin, 24, { align: 'right' });

  y = 36;

  // ── Bloque emisor / receptor ──────────────────────────────────────────────
  // Emisor
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('EMISOR', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  y += 5;
  doc.text('Fundación Fuente Agria', margin, y); y += 4.5;
  doc.text('Puertollano, Ciudad Real', margin, y); y += 4.5;
  doc.text('asociacion@fuenteagria.org', margin, y);

  // Receptor
  let ry = 36;
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('FACTURADO A', col2, ry);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  ry += 5;
  doc.text(`${user.name} ${user.subname}`, col2, ry); ry += 4.5;
  doc.text(user.email, col2, ry); ry += 4.5;
  if (user.dni)     { doc.text(`DNI/NIF: ${user.dni}`, col2, ry); ry += 4.5; }
  if (user.address) { doc.text(user.address, col2, ry); }

  y = Math.max(y, ry) + 10;

  // Línea separadora
  doc.setDrawColor(...DARK);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 7;

  // ── Tabla encargos ────────────────────────────────────────────────────────
  if (orders.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text('ENCARGOS PERSONALIZADOS', margin, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Descripción', 'Detalle', 'Estado', 'Fecha', 'Importe']],
      body: orders.map((o) => [
        o.title,
        o.text,
        ORDER_STATUS[o.status]?.label ?? o.status,
        fmtDate(o.createdAt),
        o.price != null ? `${fmt(o.price)} €` : '—',
      ]),
      foot: [
        [{ content: 'Subtotal encargos', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
          `${fmt(ordersTotal)} €`],
      ],
      headStyles:  { fillColor: DARK, textColor: WHITE, fontStyle: 'bold', fontSize: 8 },
      bodyStyles:  { fontSize: 8, textColor: [40, 40, 40] },
      footStyles:  { fillColor: LIGHT, textColor: DARK, fontStyle: 'bold', fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 38 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 22, halign: 'right' },
      },
      alternateRowStyles: { fillColor: [250, 250, 252] },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ── Tabla reservas ────────────────────────────────────────────────────────
  if (purchases.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text('RESERVAS DE CATÁLOGO', margin, y);
    y += 4;

    // Aplanamos todas las reservas en filas: cabecera de reserva + líneas de artículo
    const rows: any[] = [];
    purchases.forEach((p) => {
      const statusLabel = PURCHASE_STATUS[p.status]?.label ?? p.status;
      rows.push([
        {
          content: `Reserva #${p.id}${p.ticketCode ? `  ·  ${p.ticketCode}` : ''}  ·  ${statusLabel}  ·  ${fmtDate(p.date)}`,
          colSpan: 4,
          styles: { fontStyle: 'bold', fillColor: [230, 232, 240], textColor: DARK, fontSize: 7.5 },
        },
      ]);
      p.articles.forEach((a) => {
        rows.push([
          a.article.name,
          { content: String(a.quantity), styles: { halign: 'center' } },
          { content: `${fmt(a.estimatedPrice)} €`, styles: { halign: 'right' } },
          { content: `${fmt(a.estimatedPrice * a.quantity)} €`, styles: { halign: 'right', fontStyle: 'bold' } },
        ]);
      });
      rows.push([
        {
          content: `Subtotal reserva #${p.id}`,
          colSpan: 3,
          styles: { halign: 'right', fontStyle: 'italic', textColor: GRAY, fontSize: 7.5 },
        },
        { content: `${fmt(p.total)} €`, styles: { halign: 'right', fontStyle: 'bold', textColor: DARK } },
      ]);
    });

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Artículo', 'Cant.', 'P. unitario', 'Total línea']],
      body: rows,
      foot: [
        [{ content: 'Subtotal reservas', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
          `${fmt(purchasesTotal)} €`],
      ],
      headStyles:  { fillColor: DARK, textColor: WHITE, fontStyle: 'bold', fontSize: 8 },
      bodyStyles:  { fontSize: 8, textColor: [40, 40, 40] },
      footStyles:  { fillColor: LIGHT, textColor: DARK, fontStyle: 'bold', fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 18, halign: 'center' },
        2: { cellWidth: 28, halign: 'right' },
        3: { cellWidth: 28, halign: 'right' },
      },
      alternateRowStyles: { fillColor: [250, 250, 252] },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ── Total ─────────────────────────────────────────────────────────────────
  const boxH = 12;
  doc.setFillColor(...DARK);
  doc.roundedRect(margin, y, pageW - margin * 2, boxH, 2, 2, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL A PAGAR', margin + 5, y + 7.5);
  doc.setFontSize(12);
  doc.text(`${fmt(grandTotal)} €`, pageW - margin - 5, y + 7.5, { align: 'right' });

  y += boxH + 10;

  // ── Pie legal ─────────────────────────────────────────────────────────────
  doc.setDrawColor(200, 200, 210);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);

  const legal = [
    'Fundación Fuente Agria es una asociación sin ánimo de lucro inscrita en el Registro de Asociaciones.',
    'Los pagos realizados a esta entidad pueden ser deducibles en la Declaración de la Renta conforme a la Ley 49/2002,',
    'de régimen fiscal de las entidades sin fines lucrativos y de los incentivos fiscales al mecenazgo.',
    'Conserve este documento como justificante de pago a efectos fiscales.',
  ];
  legal.forEach((line) => {
    doc.text(line, margin, y);
    y += 4;
  });

  const filename = `factura_${user.name}_${user.subname}_${today.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

// ── Invoice modal ─────────────────────────────────────────────────────────────

interface InvoiceProps {
  billing: UserBilling;
  selectedOrders: Set<number>;
  selectedPurchases: Set<number>;
  onClose: () => void;
}

const InvoiceModal = ({ billing, selectedOrders, selectedPurchases, onClose }: InvoiceProps) => {
  const { user } = billing;
  const orders    = billing.orders.filter((o) => selectedOrders.has(o.id));
  const purchases = billing.purchases.filter((p) => selectedPurchases.has(p.id));

  const ordersTotal    = orders.reduce((s, o) => s + (o.price ?? 0), 0);
  const purchasesTotal = purchases.reduce((s, p) => s + p.total, 0);
  const grandTotal     = ordersTotal + purchasesTotal;

  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const invoiceNum = `FA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${user.id}`;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      <div className="modal-backdrop show" style={{ zIndex: 1040 }} onClick={onClose} />
      <div className="modal d-block" style={{ zIndex: 1050 }} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 rounded-4 overflow-hidden shadow-lg">

            {/* Header modal */}
            <div className="modal-header border-0 px-4 pt-4 pb-2">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ width: 40, height: 40, background: '#1a1f36' }}
                >
                  <i className="bi bi-receipt text-white" />
                </div>
                <div>
                  <h5 className="modal-title fw-bold mb-0">Vista previa de factura</h5>
                  <small className="text-muted">{user.name} {user.subname} · {invoiceNum}</small>
                </div>
              </div>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
            </div>

            {/* Cuerpo — vista previa */}
            <div className="modal-body px-4 py-3">

              {/* Cabecera */}
              <div
                className="rounded-3 px-4 py-3 mb-4 d-flex justify-content-between align-items-start flex-wrap gap-2"
                style={{ background: '#1a1f36', color: '#fff' }}
              >
                <div>
                  <div className="fw-bold" style={{ fontSize: '1rem' }}>FUNDACIÓN FUENTE AGRIA</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.7 }}>
                    Asociación sin ánimo de lucro · Puertollano, Ciudad Real
                  </div>
                </div>
                <div className="text-end">
                  <div className="fw-bold" style={{ fontSize: '1.1rem' }}>FACTURA</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Nº {invoiceNum}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{today}</div>
                </div>
              </div>

              {/* Datos cliente */}
              <div className="rounded-3 p-3 mb-4 small" style={{ background: '#f8f9fa', borderLeft: '3px solid #1a1f36' }}>
                <div className="fw-semibold mb-1" style={{ color: '#1a1f36' }}>Facturado a</div>
                <div className="fw-medium">{user.name} {user.subname}</div>
                <div className="text-muted">{user.email}</div>
                {user.dni     && <div className="text-muted">DNI/NIF: {user.dni}</div>}
                {user.address && <div className="text-muted">{user.address}</div>}
              </div>

              {/* Encargos */}
              {orders.length > 0 && (
                <div className="mb-4">
                  <div className="fw-semibold mb-2 small text-uppercase" style={{ color: '#1a1f36', letterSpacing: '.05em' }}>
                    Encargos personalizados
                  </div>
                  <table className="table table-sm mb-1" style={{ fontSize: '0.83rem' }}>
                    <thead>
                      <tr style={{ background: '#f0f1f5', fontSize: '0.72rem' }} className="text-uppercase text-muted">
                        <th className="border-0 py-2 ps-2">Descripción</th>
                        <th className="border-0 py-2">Estado</th>
                        <th className="border-0 py-2">Fecha</th>
                        <th className="border-0 py-2 text-end pe-2">Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td className="border-0 py-2 ps-2">
                            <div className="fw-medium">{o.title}</div>
                            <div className="text-muted" style={{ fontSize: '0.77rem' }}>{o.text}</div>
                          </td>
                          <td className="border-0 py-2">
                            <Badge {...(ORDER_STATUS[o.status] ?? ORDER_STATUS.PENDING)} />
                          </td>
                          <td className="border-0 py-2 text-muted">{fmtDate(o.createdAt)}</td>
                          <td className="border-0 py-2 text-end pe-2 fw-semibold">
                            {o.price != null ? `${fmt(o.price)} €` : <span className="text-muted">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#f8f9fa' }}>
                        <td colSpan={3} className="border-top pt-2 text-end small fw-semibold text-muted pe-3">Subtotal</td>
                        <td className="border-top pt-2 text-end pe-2 fw-bold">{fmt(ordersTotal)} €</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Reservas */}
              {purchases.length > 0 && (
                <div className="mb-4">
                  <div className="fw-semibold mb-2 small text-uppercase" style={{ color: '#1a1f36', letterSpacing: '.05em' }}>
                    Reservas de catálogo
                  </div>
                  {purchases.map((p) => (
                    <div key={p.id} className="mb-3 rounded-3 overflow-hidden" style={{ border: '1px solid #e9ecef' }}>
                      <div className="px-3 py-2 d-flex justify-content-between align-items-center flex-wrap gap-1"
                        style={{ background: '#f0f1f5', fontSize: '0.8rem' }}>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-semibold">Reserva #{p.id}</span>
                          {p.ticketCode && <span className="badge bg-secondary" style={{ fontSize: '0.68rem' }}>{p.ticketCode}</span>}
                          <Badge {...(PURCHASE_STATUS[p.status] ?? PURCHASE_STATUS.RESERVED)} />
                        </div>
                        <span className="text-muted">{fmtDate(p.date)}</span>
                      </div>
                      <table className="table table-sm mb-0" style={{ fontSize: '0.82rem' }}>
                        <thead>
                          <tr className="text-muted" style={{ fontSize: '0.72rem' }}>
                            <th className="border-0 pb-1 ps-3 fw-normal">Artículo</th>
                            <th className="border-0 pb-1 text-center fw-normal">Cant.</th>
                            <th className="border-0 pb-1 text-end fw-normal">P. unitario</th>
                            <th className="border-0 pb-1 text-end pe-3 fw-normal">Total línea</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.articles.map((a) => (
                            <tr key={a.id}>
                              <td className="border-0 py-1 ps-3">{a.article.name}</td>
                              <td className="border-0 py-1 text-center">{a.quantity}</td>
                              <td className="border-0 py-1 text-end">{fmt(a.estimatedPrice)} €</td>
                              <td className="border-0 py-1 text-end pe-3 fw-medium">
                                {fmt(a.estimatedPrice * a.quantity)} €
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: '#f8f9fa' }}>
                            <td colSpan={3} className="border-top pt-2 text-end small fw-semibold text-muted pe-3">Subtotal reserva</td>
                            <td className="border-top pt-2 text-end pe-3 fw-bold">{fmt(p.total)} €</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div
                className="d-flex justify-content-between align-items-center rounded-3 px-4 py-3"
                style={{ background: '#1a1f36', color: '#fff' }}
              >
                <span className="fw-bold">TOTAL A PAGAR</span>
                <span className="fw-bold" style={{ fontSize: '1.25rem' }}>{fmt(grandTotal)} €</span>
              </div>

              {/* Pie legal */}
              <div className="mt-3 px-1 text-muted" style={{ fontSize: '0.72rem', borderTop: '1px solid #e9ecef', paddingTop: '0.75rem' }}>
                Fundación Fuente Agria es una asociación sin ánimo de lucro. Los pagos realizados a esta entidad
                pueden ser deducibles en la Declaración de la Renta conforme a la Ley 49/2002, de régimen fiscal
                de las entidades sin fines lucrativos y de los incentivos fiscales al mecenazgo.
                Conserve este documento como justificante de pago a efectos fiscales.
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 px-4 pb-4 pt-2 gap-2">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-dark rounded-pill px-4 d-flex align-items-center gap-2"
                onClick={() => generateInvoicePdf(billing, orders, purchases)}
              >
                <i className="bi bi-file-earmark-pdf-fill" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Main panel ────────────────────────────────────────────────────────────────

export const FacturacionPanel = () => {
  const [users, setUsers]               = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch]             = useState('');

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [billing, setBilling]           = useState<UserBilling | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [billingError, setBillingError] = useState('');

  const [selectedOrders,    setSelectedOrders]    = useState<Set<number>>(new Set());
  const [selectedPurchases, setSelectedPurchases] = useState<Set<number>>(new Set());
  const [showInvoice, setShowInvoice] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.subname.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.dni ?? '').toLowerCase().includes(q)
    );
  });

  const handleSelectUser = async (u: AdminUser) => {
    setSelectedUser(u);
    setBilling(null);
    setBillingError('');
    setSelectedOrders(new Set());
    setSelectedPurchases(new Set());
    setLoadingBilling(true);
    try {
      const data = await getUserBilling(u.id);
      setBilling(data);
      setSelectedOrders(new Set(data.orders.filter((o) => o.price != null).map((o) => o.id)));
      setSelectedPurchases(new Set(data.purchases.map((p) => p.id)));
    } catch (e: any) {
      setBillingError(e.message);
    } finally {
      setLoadingBilling(false);
    }
  };

  const toggleOrder = (id: number) =>
    setSelectedOrders((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const togglePurchase = (id: number) =>
    setSelectedPurchases((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const ordersTotal    = billing?.orders.filter((o) => selectedOrders.has(o.id)).reduce((s, o) => s + (o.price ?? 0), 0) ?? 0;
  const purchasesTotal = billing?.purchases.filter((p) => selectedPurchases.has(p.id)).reduce((s, p) => s + p.total, 0) ?? 0;
  const grandTotal     = ordersTotal + purchasesTotal;
  const hasSelection   = selectedOrders.size > 0 || selectedPurchases.size > 0;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <div className="fw-bold fs-5">Facturación</div>
          <div className="text-muted small">Genera facturas desglosadas por cliente</div>
        </div>
      </div>

      <div className="row g-4">
        {/* Columna izquierda: buscador */}
        <div className="col-12 col-md-4">
          <div className="rounded-3 p-3" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
            <div className="fw-semibold small mb-2 d-flex align-items-center gap-2" style={{ color: '#1a1f36' }}>
              <i className="bi bi-people-fill" />
              Seleccionar cliente
            </div>
            <div className="input-group mb-2 rounded-3 overflow-hidden" style={{ border: '1px solid #dee2e6' }}>
              <span className="input-group-text bg-white border-0">
                <i className="bi bi-search text-muted" style={{ fontSize: '0.8rem' }} />
              </span>
              <input
                ref={searchRef}
                type="text"
                className="form-control border-0 shadow-none"
                placeholder="Nombre, email o DNI…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            {loadingUsers ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm" style={{ color: '#1a1f36' }} />
              </div>
            ) : (
              <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                {filteredUsers.length === 0 ? (
                  <div className="text-center text-muted small py-3">Sin resultados</div>
                ) : (
                  filteredUsers.map((u) => {
                    const isActive = selectedUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className="w-100 text-start border-0 rounded-3 px-3 py-2 mb-1 d-flex align-items-center gap-2"
                        style={{
                          background: isActive ? '#1a1f36' : 'transparent',
                          color: isActive ? '#fff' : '#374151',
                          transition: 'all .15s',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                          style={{
                            width: 30, height: 30,
                            background: isActive ? 'rgba(255,255,255,0.2)' : '#e9ecef',
                            fontSize: '0.7rem', fontWeight: 700,
                            color: isActive ? '#fff' : '#1a1f36',
                          }}
                        >
                          {u.name[0]}{u.subname[0]}
                        </div>
                        <div className="overflow-hidden">
                          <div className="fw-medium text-truncate">{u.name} {u.subname}</div>
                          <div className="text-truncate" style={{ fontSize: '0.75rem', opacity: isActive ? 0.75 : 0.6 }}>
                            {u.email}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: desglose */}
        <div className="col-12 col-md-8">
          {!selectedUser ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '3rem', opacity: 0.15 }}><i className="bi bi-receipt" /></div>
              <div className="fw-semibold text-muted mt-2">Selecciona un cliente</div>
              <div className="text-muted small mt-1">El desglose de encargos y reservas aparecerá aquí</div>
            </div>
          ) : loadingBilling ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: '#1a1f36' }} />
            </div>
          ) : billingError ? (
            <div className="alert alert-danger rounded-3 small">{billingError}</div>
          ) : billing ? (
            <div>
              {/* Info cliente */}
              <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style={{ background: '#f0f1f5' }}>
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
                  style={{ width: 44, height: 44, background: '#1a1f36', color: '#fff', fontSize: '1rem' }}
                >
                  {billing.user.name[0]}{billing.user.subname[0]}
                </div>
                <div>
                  <div className="fw-bold">{billing.user.name} {billing.user.subname}</div>
                  <div className="small text-muted d-flex gap-3 flex-wrap">
                    <span><i className="bi bi-envelope me-1" />{billing.user.email}</span>
                    {billing.user.dni     && <span><i className="bi bi-person-vcard me-1" />{billing.user.dni}</span>}
                    {billing.user.address && <span><i className="bi bi-geo-alt me-1" />{billing.user.address}</span>}
                  </div>
                </div>
              </div>

              {/* Encargos */}
              <SectionTitle icon="bi-clipboard2-check-fill" label="Encargos personalizados" count={billing.orders.length} />
              {billing.orders.length === 0
                ? <EmptySection label="Sin encargos" />
                : (
                  <div className="mb-4">
                    {billing.orders.map((o) => (
                      <OrderRow key={o.id} order={o} checked={selectedOrders.has(o.id)} onToggle={toggleOrder} />
                    ))}
                    <div className="text-end small mt-1">
                      <span className="text-muted">Subtotal:</span>{' '}
                      <span className="fw-bold">{fmt(ordersTotal)} €</span>
                    </div>
                  </div>
                )}

              {/* Reservas */}
              <SectionTitle icon="bi-bag-check-fill" label="Reservas de catálogo" count={billing.purchases.length} />
              {billing.purchases.length === 0
                ? <EmptySection label="Sin reservas" />
                : (
                  <div className="mb-4">
                    {billing.purchases.map((p) => (
                      <PurchaseRow key={p.id} purchase={p} checked={selectedPurchases.has(p.id)} onToggle={togglePurchase} />
                    ))}
                    <div className="text-end small mt-1">
                      <span className="text-muted">Subtotal:</span>{' '}
                      <span className="fw-bold">{fmt(purchasesTotal)} €</span>
                    </div>
                  </div>
                )}

              {/* Total + botón */}
              <div
                className="d-flex justify-content-between align-items-center rounded-3 px-4 py-3 mt-2"
                style={{ background: '#1a1f36', color: '#fff' }}
              >
                <span className="fw-semibold">Total seleccionado</span>
                <div className="d-flex align-items-center gap-3">
                  <span className="fw-bold fs-5">{fmt(grandTotal)} €</span>
                  <button
                    className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-2"
                    style={{ background: '#fff', color: '#1a1f36', fontWeight: 600 }}
                    disabled={!hasSelection}
                    onClick={() => setShowInvoice(true)}
                  >
                    <i className="bi bi-file-earmark-pdf-fill" />
                    Generar factura
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {showInvoice && billing && (
        <InvoiceModal
          billing={billing}
          selectedOrders={selectedOrders}
          selectedPurchases={selectedPurchases}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionTitle = ({ icon, label, count }: { icon: string; label: string; count: number }) => (
  <div className="d-flex align-items-center gap-2 mb-2 mt-3">
    <i className={`bi ${icon}`} style={{ color: '#1a1f36' }} />
    <span className="fw-semibold small" style={{ color: '#1a1f36' }}>{label}</span>
    <span className="badge rounded-pill bg-secondary" style={{ fontSize: '0.7rem' }}>{count}</span>
  </div>
);

const EmptySection = ({ label }: { label: string }) => (
  <div className="text-muted small py-2 ps-2">{label}</div>
);

const OrderRow = ({
  order, checked, onToggle,
}: { order: BillingOrder; checked: boolean; onToggle: (id: number) => void }) => {
  const cfg = ORDER_STATUS[order.status] ?? ORDER_STATUS.PENDING;
  return (
    <div
      className="d-flex align-items-start gap-3 rounded-3 px-3 py-2 mb-1"
      style={{
        background: checked ? '#f0f4ff' : '#fafafa',
        border: `1px solid ${checked ? '#c7d2fe' : '#e9ecef'}`,
        cursor: 'pointer', transition: 'all .15s',
      }}
      onClick={() => onToggle(order.id)}
    >
      <div className="form-check mb-0 mt-1 flex-shrink-0">
        <input
          className="form-check-input" type="checkbox" checked={checked}
          onChange={() => onToggle(order.id)}
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: 'pointer' }}
        />
      </div>
      <div className="flex-grow-1 overflow-hidden">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="fw-medium small text-truncate">{order.title}</span>
          <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} />
        </div>
        <div className="text-muted text-truncate" style={{ fontSize: '0.78rem' }}>{order.text}</div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{fmtDate(order.createdAt)}</div>
      </div>
      <div className="flex-shrink-0 text-end">
        {order.price != null
          ? <span className="fw-bold small">{fmt(order.price)} €</span>
          : <span className="text-muted small">Sin precio</span>}
      </div>
    </div>
  );
};

const PurchaseRow = ({
  purchase, checked, onToggle,
}: { purchase: BillingPurchase; checked: boolean; onToggle: (id: number) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = PURCHASE_STATUS[purchase.status] ?? PURCHASE_STATUS.RESERVED;
  return (
    <div
      className="rounded-3 mb-1"
      style={{
        background: checked ? '#f0f4ff' : '#fafafa',
        border: `1px solid ${checked ? '#c7d2fe' : '#e9ecef'}`,
        transition: 'all .15s',
      }}
    >
      <div className="d-flex align-items-start gap-3 px-3 py-2" style={{ cursor: 'pointer' }} onClick={() => onToggle(purchase.id)}>
        <div className="form-check mb-0 mt-1 flex-shrink-0">
          <input
            className="form-check-input" type="checkbox" checked={checked}
            onChange={() => onToggle(purchase.id)}
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div className="flex-grow-1 overflow-hidden">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="fw-medium small">Reserva #{purchase.id}</span>
            {purchase.ticketCode && <span className="badge bg-secondary" style={{ fontSize: '0.68rem' }}>{purchase.ticketCode}</span>}
            <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} />
          </div>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
            {fmtDate(purchase.date)} · {purchase.articles.length} artículo{purchase.articles.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          <span className="fw-bold small">{fmt(purchase.total)} €</span>
          <button
            type="button" className="btn btn-sm border-0 p-0"
            style={{ color: '#6c757d', background: 'transparent' }}
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          >
            <i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`} style={{ fontSize: '0.8rem' }} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-0" style={{ borderTop: '1px solid #e9ecef' }}>
          <table className="table table-sm mb-0 mt-2" style={{ fontSize: '0.8rem' }}>
            <thead>
              <tr className="text-muted" style={{ fontSize: '0.72rem' }}>
                <th className="border-0 pb-1 ps-0 fw-normal">Artículo</th>
                <th className="border-0 pb-1 text-center fw-normal">Cant.</th>
                <th className="border-0 pb-1 text-end fw-normal">P. unit.</th>
                <th className="border-0 pb-1 text-end pe-0 fw-normal">Total</th>
              </tr>
            </thead>
            <tbody>
              {purchase.articles.map((a) => (
                <tr key={a.id}>
                  <td className="border-0 py-1 ps-0">{a.article.name}</td>
                  <td className="border-0 py-1 text-center">{a.quantity}</td>
                  <td className="border-0 py-1 text-end">{fmt(a.estimatedPrice)} €</td>
                  <td className="border-0 py-1 text-end pe-0 fw-medium">{fmt(a.estimatedPrice * a.quantity)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
