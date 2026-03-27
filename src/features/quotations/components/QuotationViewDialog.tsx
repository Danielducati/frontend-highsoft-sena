import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../shared/ui/dialog";
import { Quotation, QuotationStatus } from "../types";
import { STATUS_LABELS } from "../constants";

interface QuotationViewDialogProps {
  quotation: Quotation | null;
  onClose: () => void;
}

function StatusBadge({ status }: { status: QuotationStatus }) {
  const colors: Record<string, React.CSSProperties> = {
    pending:   { backgroundColor: "#fef9ec", color: "#b45309" },
    approved:  { backgroundColor: "#edf7f4", color: "#1a5c3a" },
    cancelled: { backgroundColor: "#fdf0ee", color: "#c0392b" },
    completed: { backgroundColor: "#eff6ff", color: "#1e40af" },
  };
  return (
    <span style={{
      display: "inline-flex", padding: "4px 14px", borderRadius: 999,
      fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em",
      fontFamily: "sans-serif", ...(colors[status] ?? { backgroundColor: "#f3f4f6", color: "#6b7280" }),
    }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function QuotationViewDialog({ quotation, onClose }: QuotationViewDialogProps) {
  return (
    <Dialog open={!!quotation} onOpenChange={onClose}>
      <DialogContent style={{
        backgroundColor: "#faf7f2", borderRadius: 16, border: "1px solid #ede8e0",
        padding: 32, maxWidth: 560, maxHeight: "90vh", overflowY: "auto", fontFamily: "sans-serif",
      }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Georgia', serif", fontSize: 22, color: "#1a3a2a", fontWeight: "normal" }}>
            Cotización #{quotation?.id.toString().padStart(4, "0")}
          </DialogTitle>
          <DialogDescription style={{ color: "#6b7c6b", fontSize: 13 }}>
            {quotation?.date
              ? new Date(quotation.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
              : "—"}
          </DialogDescription>
        </DialogHeader>

        {quotation && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 12 }}>

            {/* Cliente + Estado */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              padding: "16px 20px", borderRadius: 12, backgroundColor: "#f0ebe3",
            }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7c6b", marginBottom: 4 }}>
                  Cliente
                </p>
                <p style={{ fontWeight: 600, color: "#1a3a2a", fontSize: 15 }}>{quotation.clientName}</p>
                <p style={{ fontSize: 13, color: "#6b7c6b", marginTop: 2 }}>{quotation.clientEmail}</p>
              </div>
              <StatusBadge status={quotation.status} />
            </div>

            {/* Servicios */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7c6b", marginBottom: 10 }}>
                Servicios
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {quotation.items?.map((item, i) => (
                  <div key={i} style={{
                    padding: "12px 16px", borderRadius: 10, backgroundColor: "#ffffff",
                    border: "1px solid #ede8e0", display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <p style={{ fontSize: 14, color: "#1a3a2a", fontWeight: 500 }}>{item.serviceName}</p>
                      <p style={{ fontSize: 12, color: "#6b7c6b", marginTop: 2 }}>Cantidad: {item.quantity}</p>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#1a3a2a" }}>
                      ${(item.price * item.quantity).toLocaleString("es-CO")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div style={{ borderTop: "1px solid #ede8e0", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7c6b", fontSize: 14 }}>Subtotal</span>
                <span style={{ color: "#1a3a2a", fontSize: 14 }}>${(quotation.subtotal || 0).toLocaleString("es-CO")}</span>
              </div>
              {quotation.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#1a5c3a", fontSize: 14 }}>Descuento</span>
                  <span style={{ color: "#1a5c3a", fontSize: 14 }}>-${quotation.discount.toLocaleString("es-CO")}</span>
                </div>
              )}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                borderTop: "1px solid #ede8e0", paddingTop: 10, marginTop: 4,
              }}>
                <span style={{ color: "#1a3a2a", fontSize: 16, fontFamily: "'Georgia', serif" }}>Total</span>
                <span style={{ color: "#1a3a2a", fontSize: 22, fontWeight: 700, fontFamily: "'Georgia', serif" }}>
                  ${(quotation.total || 0).toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            {/* Notas */}
            {quotation.notes && (
              <div style={{ padding: "12px 16px", borderRadius: 10, backgroundColor: "#f0ebe3", border: "1px solid #ede8e0" }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7c6b", marginBottom: 6 }}>
                  Notas
                </p>
                <p style={{ fontSize: 14, color: "#1a3a2a" }}>{quotation.notes}</p>
              </div>
            )}

            {/* Cerrar */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{
                padding: "9px 20px", borderRadius: 10, border: "1px solid #d6cfc4",
                backgroundColor: "transparent", color: "#1a3a2a", fontSize: 14,
                fontFamily: "sans-serif", cursor: "pointer",
              }}>Cerrar</button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}