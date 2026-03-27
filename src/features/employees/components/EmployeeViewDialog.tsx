import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../shared/ui/dialog";
import { Employee } from "../types";
import { ImageWithFallback } from "../../guidelines/figma/ImageWithFallback";

interface EmployeeViewDialogProps {
  employee: Employee | null;
  onClose: () => void;
}

const fieldLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#6b7c6b",
  marginBottom: 3,
  fontFamily: "sans-serif",
};

const fieldValue: React.CSSProperties = {
  fontSize: 14,
  color: "#1a3a2a",
  fontFamily: "sans-serif",
};

export function EmployeeViewDialog({ employee, onClose }: EmployeeViewDialogProps) {
  return (
    <Dialog open={!!employee} onOpenChange={onClose}>
      <DialogContent
        style={{
          backgroundColor: "#faf7f2",
          borderRadius: 16,
          border: "1px solid #ede8e0",
          padding: 32,
          maxWidth: 480,
          fontFamily: "sans-serif",
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{ fontFamily: "'Georgia', serif", fontSize: 22, color: "#1a3a2a", fontWeight: "normal" }}
          >
            Detalles del Empleado
          </DialogTitle>
          <DialogDescription style={{ color: "#6b7c6b", fontSize: 13 }}>
            Información completa del colaborador
          </DialogDescription>
        </DialogHeader>

        {employee && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 8 }}>

            {/* Avatar + nombre */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 20px",
                borderRadius: 12,
                backgroundColor: "#f0ebe3",
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid #c8ead9",
                  backgroundColor: "#edf7f4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "#1a5c3a",
                  fontWeight: 700,
                  fontSize: 22,
                }}
              >
                {employee.image
                  ? <ImageWithFallback src={employee.image} alt={employee.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : employee.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 600, color: "#1a3a2a", fontSize: 17 }}>{employee.name}</p>
                <span
                  style={{
                    display: "inline-flex",
                    marginTop: 4,
                    padding: "3px 12px",
                    borderRadius: 999,
                    backgroundColor: "#edf7f4",
                    color: "#1a5c3a",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {employee.specialty || "Sin especialidad"}
                </span>
              </div>
            </div>

            {/* Campos en grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Correo",     value: employee.email             },
                { label: "Teléfono",   value: employee.phone             },
                { label: "Ciudad",     value: employee.ciudad            },
                { label: "Documento",  value: `${employee.tipo_documento ?? ""} ${employee.numero_documento ?? ""}`.trim() || "—" },
                { label: "Dirección",  value: employee.direccion         },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={fieldLabel}>{label}</p>
                  <p style={fieldValue}>{value || "—"}</p>
                </div>
              ))}

              {/* Estado */}
              <div>
                <p style={fieldLabel}>Estado</p>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "4px 14px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    ...(employee.isActive
                      ? { backgroundColor: "#edf7f4", color: "#1a5c3a" }
                      : { backgroundColor: "#f3f4f6", color: "#9ca3af" }),
                  }}
                >
                  {employee.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>

            {/* Cerrar */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
              <button
                onClick={onClose}
                style={{
                  padding: "9px 20px", borderRadius: 10,
                  border: "1px solid #d6cfc4", backgroundColor: "transparent",
                  color: "#1a3a2a", fontSize: 14, fontFamily: "sans-serif", cursor: "pointer",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}