import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/ui/dialog";
import { Plus } from "lucide-react";
import { Category, CategoryFormData } from "../types";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  editingCategory: Category | null;
  formData: CategoryFormData;
  setFormData: (d: CategoryFormData) => void;
  onSubmit: () => void;
  onNewClick: () => void;
  userRole: string;
  canCreate?: boolean;
}

export function CategoryFormDialog({
  isOpen, onOpenChange, editingCategory, formData, setFormData, onSubmit, onNewClick, userRole, canCreate,
}: CategoryFormDialogProps) {
  const hasAccess = userRole === "admin" || canCreate;
  if (!hasAccess) return null;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #d6cfc4",
    backgroundColor: "#faf7f2",
    color: "#1a3a2a",
    fontSize: 14,
    fontFamily: "var(--font-body)",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#6b7c6b",
    marginBottom: 6,
    fontFamily: "var(--font-body)",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          onClick={onNewClick}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 10,
            backgroundColor: "#1a3a2a",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "var(--font-body)",
            border: "none",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
        >
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </button>
      </DialogTrigger>

      <DialogContent
        className="hl-form-dialog"
        style={{
          backgroundColor: "#faf7f2",
          borderRadius: 16,
          border: "1px solid #ede8e0",
          padding: 32,
          maxWidth: 480,
          fontFamily: "var(--font-body)",
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 22,
              color: "#1a3a2a",
              fontWeight: 700,
            }}
          >
            {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
          </DialogTitle>
          <DialogDescription style={{ color: "#6b7c6b", fontSize: 13 }}>
            {editingCategory
              ? "Actualiza la información de la categoría"
              : "Crea una nueva categoría de servicios"}
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 8 }}>
          {/* Nombre */}
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input
              style={inputStyle}
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Masajes"
            />
          </div>

          {/* Descripción */}
          <div>
            <label style={labelStyle}>Descripción</label>
            <input
              style={inputStyle}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe la categoría..."
            />
          </div>

          {/* Color */}
          <div>
            <label style={labelStyle}>Color de Identificación</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="color"
                value={formData.color}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                style={{
                  width: 44,
                  height: 44,
                  padding: 2,
                  borderRadius: 8,
                  border: "1px solid #d6cfc4",
                  backgroundColor: "#faf7f2",
                  cursor: "pointer",
                }}
              />
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={formData.color}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                placeholder="#78D1BD"
              />
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8 }}>
            <button
              onClick={() => onOpenChange(false)}
              style={{
                padding: "9px 18px",
                borderRadius: 10,
                border: "1px solid #d6cfc4",
                backgroundColor: "transparent",
                color: "#1a3a2a",
                fontSize: 14,
                fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={onSubmit}
              style={{
                padding: "9px 18px",
                borderRadius: 10,
                border: "none",
                backgroundColor: "#1a3a2a",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
            >
              {editingCategory ? "Actualizar" : "Crear Categoría"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
