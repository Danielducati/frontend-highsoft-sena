import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../shared/ui/dialog";
import { Sale } from "../types";
import { formatDate } from "../utils";

interface SaleDetailDialogProps {
  sale:    Sale | null;
  onClose: () => void;
}

const fieldLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
  textTransform: "uppercase", color: "#6b7c6b",
  marginBottom: 3, fontFamily: "var(--font-body)",
};

export function SaleDetailDialog({ sale, onClose }: SaleDetailDialogProps) {
  if (!sale) return null;
  return (
    <Dialog open={!!sale} onOpenChange={onClose}>
      <DialogContent style={{
        backgroundColor: "#faf7f2", borderRadius: 16, border: "1px solid #ede8e0",
        padding: 32, maxWidth: 500, fontFamily: "var(--font-body)",
      }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-body)", fontSize: 22, color: "#1a3a2a", fontWeight: 700 }}>
            Detalle de Venta
          </DialogTitle>
          <DialogDescription style={{ color: "#6b7c6b", fontSize: 13 }}>
            Información completa de la transacción
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 12 }}>

          {/* Info principal */}
          <div style={{
            padding: "16px 20px", borderRadius: 12, backgroundColor: "#f0ebe3",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
          }}>
            {[
              { label: "Cliente",        value: sale.Cliente     },
              { label: "Servicio",       value: sale.Servicio    },
              { label: "Método de pago", value: sale.metodo_pago },
              { label: "Fecha",          value: formatDate(sale.Fecha) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={fieldLabel}>{label}</p>
                <p style={{ fontSize: 14, color: "#1a3a2a" }}>{value || "—"}</p>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7c6b", fontSize: 14 }}>Subtotal</span>
              <span style={{ color: "#1a3a2a", fontSize: 14 }}>${(sale.Subtotal || 0).toLocaleString("es-CO")}</span>
            </div>
            {sale.descuento > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#1a5c3a", fontSize: 14 }}>Descuento</span>
                <span style={{ color: "#1a5c3a", fontSize: 14 }}>-${sale.descuento.toLocaleString("es-CO")}</span>
              </div>
            )}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderTop: "1px solid #ede8e0", paddingTop: 12, marginTop: 4,
            }}>
              <span style={{ color: "#1a3a2a", fontSize: 16, fontFamily: "var(--font-body)", fontWeight: 600 }}>Total</span>
              <span style={{ color: "#1a3a2a", fontSize: 24, fontWeight: 700, fontFamily: "var(--font-body)" }}>
                ${(sale.Total || 0).toLocaleString("es-CO")}
              </span>
            </div>
          </div>

          {/* Cerrar */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{
              padding: "9px 20px", borderRadius: 10, border: "1px solid #d6cfc4",
              backgroundColor: "transparent", color: "#1a3a2a", fontSize: 14,
              fontFamily: "var(--font-body)", cursor: "pointer",
            }}>Cerrar</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
