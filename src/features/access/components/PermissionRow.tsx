import { Badge } from "../../../shared/ui/badge";
import { Eye, Pencil, Trash2, Lock, Layers } from "lucide-react";
import { AccessPermission } from "../types";
import { getModuleColor, getActionColor } from "../utils";

interface PermissionRowProps {
  permission: AccessPermission;
  userRole: string;
  onView: (permission: AccessPermission) => void;
  onEdit: (permission: AccessPermission) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export function PermissionRow({
  permission,
  userRole,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: PermissionRowProps) {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 px-6 py-4 items-start lg:items-center"
      style={{ fontFamily: "var(--font-body)" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = "#ffffff")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent")}
    >
        {/* Permiso */}
        <div className="lg:col-span-3 flex items-center gap-2 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #78D1BD, #5FBFAA)" }}
          >
            <Lock className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate" style={{ color: "#1a3a2a" }}>{permission.name}</p>
            <Badge className={`${getActionColor(permission.action)} text-xs px-1.5 py-0 h-4 mt-0.5`}>
              {permission.action}
            </Badge>
          </div>
        </div>

        {/* Descripción */}
        <div className="lg:col-span-4 min-w-0">
          <p className="text-xs line-clamp-2" style={{ color: "#6b7c6b" }}>{permission.description}</p>
        </div>

        {/* Módulo */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3 h-3" style={{ color: "#6b7c6b" }} />
            <Badge className={`${getModuleColor(permission.module)} text-xs px-1.5 py-0 h-4`}>
              {permission.module}
            </Badge>
          </div>
        </div>

        {/* Estado */}
        <div className="lg:col-span-1">
          {userRole === "admin" ? (
            <button
              onClick={() => onToggleStatus(permission.id)}
              style={{
                display: "inline-flex",
                padding: "3px 12px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.04em",
                border: "none",
                cursor: "pointer",
                backgroundColor: permission.isActive ? "#edf7f4" : "#f3f4f6",
                color: permission.isActive ? "#1a5c3a" : "#6b7280",
              }}
            >
              {permission.isActive ? "Activo" : "Inactivo"}
            </button>
          ) : (
            <span
              style={{
                display: "inline-flex",
                padding: "3px 12px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.04em",
                backgroundColor: permission.isActive ? "#edf7f4" : "#f3f4f6",
                color: permission.isActive ? "#1a5c3a" : "#6b7280",
              }}
            >
              {permission.isActive ? "Activo" : "Inactivo"}
            </span>
          )}
        </div>

        {/* Acciones */}
        <div className="lg:col-span-2 flex items-center justify-end gap-1">
          {userRole === "admin" && (
            <>
              <button
                onClick={() => onView(permission)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "#6b7c6b" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                title="Ver detalles"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(permission)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "#6b7c6b" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(permission.id)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "#c0392b" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fdf2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
    </div>
  );
}
