import { AlertCircle } from "lucide-react";
import { QuotationStatus } from "../types";
import { STATUS_LABELS } from "../constants";

interface QuotationStatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  currentStatus: QuotationStatus;
  newStatus: QuotationStatus;
  quotationId: number;
}

export function QuotationStatusChangeDialog({
  open,
  onOpenChange,
  onConfirm,
  currentStatus,
  newStatus,
  quotationId,
}: QuotationStatusChangeDialogProps) {
  if (!open) return null;

  const getStatusColor = (status: QuotationStatus) => {
    const colors: Record<QuotationStatus, string> = {
      pending: "#b45309",
      approved: "#1a5c3a",
      rejected: "#c0392b",
      cancelled: "#c0392b",
      expired: "#6b7280",
    };
    return colors[status] ?? "#6b7280";
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        fontFamily: "var(--font-body)",
      }}
      onClick={() => onOpenChange(false)}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 16,
          padding: 32,
          maxWidth: 480,
          width: "90%",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: "#fef9ec",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertCircle style={{ width: 24, height: 24, color: "#b45309" }} />
          </div>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1a3a2a", marginBottom: 4 }}>
              Confirmar cambio de estado
            </h3>
            <p style={{ fontSize: 13, color: "#6b7c6b" }}>
              Cotización #{quotationId.toString().padStart(4, "0")}
            </p>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <p style={{ fontSize: 14, color: "#1a3a2a", marginBottom: 12 }}>
            ¿Estás seguro de cambiar el estado de esta cotización?
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: "#6b7c6b", marginBottom: 4, fontWeight: 600 }}>
                Estado actual
              </p>
              <span
                style={{
                  display: "inline-flex",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor: `${getStatusColor(currentStatus)}15`,
                  color: getStatusColor(currentStatus),
                }}
              >
                {STATUS_LABELS[currentStatus]}
              </span>
            </div>
            <div style={{ fontSize: 20, color: "#6b7c6b" }}>→</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: "#6b7c6b", marginBottom: 4, fontWeight: 600 }}>
                Nuevo estado
              </p>
              <span
                style={{
                  display: "inline-flex",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor: `${getStatusColor(newStatus)}15`,
                  color: getStatusColor(newStatus),
                }}
              >
                {STATUS_LABELS[newStatus]}
              </span>
            </div>
          </div>
        </div>

        {/* Warning for approved status */}
        {newStatus === "approved" && (
          <div
            style={{
              backgroundColor: "#edf7f4",
              border: "1px solid #1a5c3a30",
              borderRadius: 10,
              padding: 12,
              marginBottom: 24,
            }}
          >
            <p style={{ fontSize: 13, color: "#1a5c3a", fontWeight: 500 }}>
              ℹ️ Al aprobar esta cotización se creará automáticamente una cita en el sistema.
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            onClick={() => onOpenChange(false)}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              backgroundColor: "transparent",
              color: "#1a3a2a",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              backgroundColor: "#1a3a2a",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a5a40")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
          >
            Confirmar cambio
          </button>
        </div>
      </div>
    </div>
  );
}
