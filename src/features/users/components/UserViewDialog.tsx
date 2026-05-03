import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../shared/ui/dialog";
import { User } from "../types";
import { getRoleBadgeColor } from "../utils";
import { ImageWithFallback } from "../../guidelines/figma/ImageWithFallback";

interface UserViewDialogProps {
  user: User | null;
  onClose: () => void;
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#6b7c6b",
  marginBottom: 3,
  fontFamily: "var(--font-body)",
};

const valueStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#1a3a2a",
  fontFamily: "var(--font-body)",
};

export function UserViewDialog({ user, onClose }: UserViewDialogProps) {
  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 16,
          border: "1px solid #E5E7EB",
          padding: 32,
          maxWidth: 480,
          fontFamily: "var(--font-body)",
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#1a3a2a", fontWeight: "normal" }}>
            Detalles del Usuario
          </DialogTitle>
          <DialogDescription style={{ color: "#6b7c6b", fontSize: 13 }}>
            Información completa del usuario
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 8 }}>

            {/* Avatar + nombre + rol */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: 12, backgroundColor: "#F3F4F6" }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%", overflow: "hidden",
                border: "2px solid #c8ead9", backgroundColor: "#edf7f4",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, color: "#1a5c3a", fontWeight: 700, fontSize: 22,
              }}>
                {user.photo
                  ? <ImageWithFallback src={user.photo} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, color: "#1a3a2a", fontSize: 17, marginBottom: 4 }}>{user.name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{
                    display: "inline-flex", padding: "3px 12px", borderRadius: 999,
                    backgroundColor: "#edf7f4", color: "#1a5c3a", fontSize: 12, fontWeight: 600,
                  }}>
                    {user.role || "Sin rol"}
                  </span>
                  <span style={{
                    display: "inline-flex", padding: "3px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                    ...(user.isActive
                      ? { backgroundColor: "#edf7f4", color: "#1a5c3a" }
                      : { backgroundColor: "#f3f4f6", color: "#9ca3af" }),
                  }}>
                    {user.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </div>

            {/* Campos en grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Correo",     value: user.email },
                { label: "Teléfono",   value: user.phone },
                { label: "Documento",  value: `${user.documentType ?? ""} ${user.document ?? ""}`.trim() || "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={labelStyle}>{label}</p>
                  <p style={valueStyle}>{value || "—"}</p>
                </div>
              ))}

              {user.createdAt && (
                <div>
                  <p style={labelStyle}>Fecha de registro</p>
                  <p style={valueStyle}>{new Date(user.createdAt).toLocaleDateString("es-CO")}</p>
                </div>
              )}

              {user.lastLogin && (
                <div>
                  <p style={labelStyle}>Último acceso</p>
                  <p style={valueStyle}>{new Date(user.lastLogin).toLocaleDateString("es-CO")}</p>
                </div>
              )}
            </div>

            {/* Cerrar */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
              <button
                onClick={onClose}
                style={{
                  padding: "9px 20px", borderRadius: 10,
                  border: "1px solid #E5E7EB", backgroundColor: "transparent",
                  color: "#1a3a2a", fontSize: 14, fontFamily: "var(--font-body)", cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
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
