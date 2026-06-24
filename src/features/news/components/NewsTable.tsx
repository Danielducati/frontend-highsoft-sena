import { Eye, Pencil, Trash2, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { EmployeeNews } from "../types";
import { getTypeConfig, getTypeColor, getStatusColor, getStatusLabel, formatDate } from "../utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { usePermisos } from "../../../shared/hooks/usePermisos";

interface NewsTableProps {
  news:           EmployeeNews[];
  userRole:       "admin" | "employee" | "client";
  onView:         (item: EmployeeNews) => void;
  onEdit:         (item: EmployeeNews) => void;
  onDelete:       (id: number) => void;
  onUpdateStatus: (id: number, status: string) => void;
}

export function NewsTable({ news, userRole, onView, onEdit, onDelete, onUpdateStatus }: NewsTableProps) {
  const { can } = usePermisos();

  const ActionButtons = ({ item }: { item: EmployeeNews }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <button onClick={() => onView(item)} title="Ver detalles"
        style={{ padding: "6px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#6b7c6b" }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
        <Eye style={{ width: 15, height: 15 }} />
      </button>
      {can("novedades.editar") && (
        <button onClick={() => item.status === "pendiente" && onEdit(item)}
          disabled={item.status !== "pendiente"}
          title={item.status !== "pendiente" ? "No editable" : "Editar"}
          style={{ padding: "6px", borderRadius: 8, border: "none", background: "transparent", cursor: item.status === "pendiente" ? "pointer" : "not-allowed", color: item.status === "pendiente" ? "#6b7c6b" : "#9ca3af", opacity: item.status === "pendiente" ? 1 : 0.4 }}
          onMouseEnter={e => item.status === "pendiente" && (e.currentTarget.style.backgroundColor = "#F3F4F6")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
          <Pencil style={{ width: 15, height: 15 }} />
        </button>
      )}
      {can("novedades.eliminar") && (
        <button onClick={() => item.status === "pendiente" && onDelete(item.id)}
          disabled={item.status !== "pendiente"}
          title={item.status !== "pendiente" ? "No eliminable" : "Eliminar"}
          style={{ padding: "6px", borderRadius: 8, border: "none", background: "transparent", cursor: item.status === "pendiente" ? "pointer" : "not-allowed", color: item.status === "pendiente" ? "#c0392b" : "#9ca3af", opacity: item.status === "pendiente" ? 1 : 0.4 }}
          onMouseEnter={e => item.status === "pendiente" && (e.currentTarget.style.backgroundColor = "#fdf0ee")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
          <Trash2 style={{ width: 15, height: 15 }} />
        </button>
      )}
    </div>
  );

  const StatusControl = ({ item }: { item: EmployeeNews }) =>
    can("novedades.editar") ? (
      <Select value={item.status} onValueChange={v => onUpdateStatus(item.id, v)}>
        <SelectTrigger className={`h-7 w-[120px] text-xs font-semibold rounded-full border-none shadow-none ${getStatusColor(item.status)}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pendiente">Pendiente</SelectItem>
          <SelectItem value="aprobada">Aprobada</SelectItem>
          <SelectItem value="rechazada">Rechazada</SelectItem>
        </SelectContent>
      </Select>
    ) : (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
        {getStatusLabel(item.status)}
      </span>
    );

  if (news.length === 0) {
    return (
      <div style={{ padding: "48px 16px", textAlign: "center" }}>
        <AlertCircle style={{ width: 40, height: 40, color: "#d1d5db", margin: "0 auto 12px" }} />
        <p style={{ color: "#6b7280", fontSize: 14 }}>No se encontraron novedades</p>
      </div>
    );
  }

  return (
    <>
      {/* ── CSS responsive ── */}
      <style>{`
        .news-table-wrap { display: block; }
        .news-cards-wrap  { display: none; }
        @media (max-width: 640px) {
          .news-table-wrap { display: none; }
          .news-cards-wrap  { display: flex; flex-direction: column; gap: 10px; padding: 12px; }
        }
      `}</style>

      {/* ── Tabla desktop ── */}
      <div className="news-table-wrap module-table-scroll overflow-x-auto">
        <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}>
          <thead style={{ background: "linear-gradient(to right, #f9fafb, #f3f4f6)", borderBottom: "1px solid #e5e7eb" }}>
            <tr>
              {["Empleado", "Tipo", "Fecha Inicio", "Fecha Final", "Hora", "Estado", "Acciones"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {news.map(item => {
              const cfg = getTypeConfig(item.type);
              const TypeIcon = cfg.icon;
              return (
                <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <TypeIcon style={{ width: 14, height: 14, flexShrink: 0 }} className={cfg.color} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{item.employeeName}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(item.type)}`}>{cfg.label}</span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#374151" }}>
                      <CalendarIcon style={{ width: 13, height: 13, color: "#9ca3af" }} />
                      <span style={{ fontSize: 13 }}>{formatDate(item.date)}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#374151" }}>
                      <CalendarIcon style={{ width: 13, height: 13, color: "#9ca3af" }} />
                      <span style={{ fontSize: 13 }}>{formatDate(item.fechaFinal ?? "")}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {item.startTime || item.endTime ? (
                      <div style={{ fontSize: 13, color: "#374151" }}>
                        <div>{item.startTime}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{item.endTime}</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "#edf7f4", color: "#1a5c3a", border: "1px solid rgba(120,209,189,0.4)" }}>Día completo</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 14px" }}><StatusControl item={item} /></td>
                  <td style={{ padding: "10px 14px" }}><ActionButtons item={item} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Tarjetas móvil ── */}
      <div className="news-cards-wrap">
        {news.map(item => {
          const cfg = getTypeConfig(item.type);
          const TypeIcon = cfg.icon;
          return (
            <div key={item.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              {/* Header tarjeta */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <TypeIcon style={{ width: 15, height: 15, flexShrink: 0 }} className={cfg.color} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{item.employeeName}</span>
                </div>
                <ActionButtons item={item} />
              </div>

              {/* Tipo + Estado */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(item.type)}`}>{cfg.label}</span>
                <StatusControl item={item} />
              </div>

              {/* Fechas y hora */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", fontSize: 12, color: "#6b7280" }}>
                <div>
                  <span style={{ fontWeight: 600, color: "#9ca3af", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Inicio</span>
                  <div style={{ color: "#374151", marginTop: 2 }}>{formatDate(item.date)}</div>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: "#9ca3af", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Final</span>
                  <div style={{ color: "#374151", marginTop: 2 }}>{formatDate(item.fechaFinal ?? "")}</div>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: "#9ca3af", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Hora</span>
                  <div style={{ color: "#374151", marginTop: 2 }}>
                    {item.startTime || item.endTime
                      ? `${item.startTime}${item.endTime ? ` – ${item.endTime}` : ""}`
                      : "Día completo"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
