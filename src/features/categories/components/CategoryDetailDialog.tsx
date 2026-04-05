import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../shared/ui/dialog";
import { Category } from "../types";

interface CategoryDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  category: Category | null;
}

export function CategoryDetailDialog({ isOpen, onOpenChange, category }: CategoryDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        style={{
          backgroundColor: "#faf7f2",
          borderRadius: 16,
          border: "1px solid #ede8e0",
          padding: 32,
          maxWidth: 440,
          fontFamily: "var(--font-body)",
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              color: "#1a3a2a",
              fontWeight: "normal",
            }}
          >
            Detalle de Categoría
          </DialogTitle>
          <DialogDescription style={{ color: "#6b7c6b", fontSize: 13 }}>
            Información completa de la categoría
          </DialogDescription>
        </DialogHeader>

        {category && (
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
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: category.color + "22",
                  border: `3px solid ${category.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: category.color,
                  }}
                />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: "#1a3a2a", fontSize: 16 }}>{category.name}</p>
                <p style={{ fontSize: 12, color: "#6b7c6b", marginTop: 2 }}>ID: {category.id}</p>
              </div>
            </div>

            {/* Campos */}
            {[
              { label: "Descripción",           value: category.description           },
              { label: "Color de Identificación", value: category.color, isColor: true },
              { label: "Cantidad de Servicios",  value: `${category.servicesCount} servicios` },
            ].map(({ label, value, isColor }) => (
              <div key={label}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#6b7c6b",
                    marginBottom: 4,
                  }}
                >
                  {label}
                </p>
                {isColor ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        backgroundColor: category.color,
                        border: "1px solid #d6cfc4",
                      }}
                    />
                    <p style={{ color: "#1a3a2a", fontSize: 14 }}>{value}</p>
                  </div>
                ) : (
                  <p style={{ color: "#1a3a2a", fontSize: 14 }}>{value}</p>
                )}
              </div>
            ))}

            {/* Estado */}
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#6b7c6b",
                  marginBottom: 6,
                }}
              >
                Estado
              </p>
              <span
                style={{
                  display: "inline-flex",
                  padding: "4px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  ...(category.isActive
                    ? { backgroundColor: "#edf7f4", color: "#1a5c3a" }
                    : { backgroundColor: "#f3f4f6", color: "#9ca3af" }),
                }}
              >
                {category.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>

            {/* Cerrar */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
              <button
                onClick={() => onOpenChange(false)}
                style={{
                  padding: "9px 20px",
                  borderRadius: 10,
                  border: "1px solid #d6cfc4",
                  backgroundColor: "transparent",
                  color: "#1a3a2a",
                  fontSize: 14,
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
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
