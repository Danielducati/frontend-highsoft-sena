import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../../../shared/ui/alert-dialog";
import { AlertCircle } from "lucide-react";

interface QuotationCancelDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}

export function QuotationCancelDialog({ open, onOpenChange, onConfirm }: QuotationCancelDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent style={{
        backgroundColor: "#faf7f2", borderRadius: 16, border: "1px solid #ede8e0",
        padding: 32, maxWidth: 420, fontFamily: "sans-serif",
      }}>
        <AlertDialogHeader>
          <AlertDialogTitle style={{
            display: "flex", alignItems: "center", gap: 10,
            fontFamily: "'Georgia', serif", fontSize: 20, color: "#1a3a2a", fontWeight: "normal",
          }}>
            <AlertCircle style={{ width: 20, height: 20, color: "#c0392b", flexShrink: 0 }} />
            ¿Cancelar esta cotización?
          </AlertDialogTitle>
          <AlertDialogDescription style={{ color: "#6b7c6b", fontSize: 14, marginTop: 8 }}>
            El estado de la cotización cambiará a <strong>Cancelada</strong>. Esta acción puede revertirse
            cambiando el estado desde la tabla de cotizaciones.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <AlertDialogCancel onClick={() => onOpenChange(false)} style={{
            padding: "9px 18px", borderRadius: 10, border: "1px solid #d6cfc4",
            backgroundColor: "transparent", color: "#1a3a2a", fontSize: 14, cursor: "pointer",
          }}>
            Volver
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} style={{
            padding: "9px 18px", borderRadius: 10, border: "none",
            backgroundColor: "#c0392b", color: "#ffffff", fontSize: 14,
            fontWeight: 600, cursor: "pointer",
          }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#a93226")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#c0392b")}>
            Cancelar Cotización
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}