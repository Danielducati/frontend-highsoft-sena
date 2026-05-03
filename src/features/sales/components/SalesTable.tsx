import { Eye, Receipt, ShoppingCart } from "lucide-react";
import { Sale } from "../types";
import { formatDate } from "../utils";

interface SalesTableProps {
  sales:   Sale[];
  loading: boolean;
  onView:  (sale: Sale) => void;
}

const METHOD_COLORS: Record<string, React.CSSProperties> = {
  "Efectivo":       { backgroundColor: "#edf7f4", color: "#1a5c3a" },
  "Tarjeta":        { backgroundColor: "#eff6ff", color: "#1e40af" },
  "Transferencia":  { backgroundColor: "#fef9ec", color: "#b45309" },
  "Nequi":          { backgroundColor: "#f5f0ff", color: "#6d28d9" },
  "Daviplata":      { backgroundColor: "#fff0f0", color: "#c0392b" },
};

export function SalesTable({ sales, loading, onView }: SalesTableProps) {
  if (loading) return (
    <p className="text-center py-12 text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
      Cargando ventas...
    </p>
  );

  if (sales.length === 0) return (
    <div className="flex flex-col items-center py-16" style={{ fontFamily: "var(--font-body)" }}>
      <ShoppingCart className="w-10 h-10 mb-3" style={{ color: "#E5E7EB" }} />
      <p className="font-medium" style={{ color: "#1a3a2a" }}>No se encontraron ventas</p>
      <p className="text-sm mt-1" style={{ color: "#6b7c6b" }}>Intenta ajustar los filtros de búsqueda</p>
    </div>
  );

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "#ffffff" }}>
      <table className="w-full" style={{ fontFamily: "var(--font-body)" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
            {["N°", "CLIENTE", "SERVICIO", "MÉTODO DE PAGO", "TOTAL", "FECHA", "ACCIONES"].map(col => (
              <th key={col} className="px-6 py-4 text-left text-xs font-semibold tracking-widest" style={{ color: "#6b7c6b" }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sales.map((sale, idx) => (
            <tr key={sale.id ?? idx}
              style={{ borderBottom: idx < sales.length - 1 ? "1px solid #E5E7EB" : "none", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#ffffff")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>

              {/* N° */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#F3F4F6" }}>
                    <Receipt className="w-4 h-4" style={{ color: "#6b7c6b" }} />
                  </div>
                  <span className="text-sm font-mono" style={{ color: "#6b7c6b" }}>
                    #{(idx + 1).toString().padStart(4, "0")}
                  </span>
                </div>
              </td>

              {/* Cliente */}
              <td className="px-6 py-4">
                <p className="font-medium text-sm" style={{ color: "#1a3a2a" }}>{sale.Cliente || "—"}</p>
              </td>

              {/* Servicio */}
              <td className="px-6 py-4">
                <p className="text-sm" style={{ color: "#6b7c6b" }}>{sale.Servicio || "—"}</p>
              </td>

              {/* Método de pago */}
              <td className="px-6 py-4">
                <span style={{
                  display: "inline-flex", padding: "3px 12px", borderRadius: 999,
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
                  ...(METHOD_COLORS[sale.metodo_pago] ?? { backgroundColor: "#f3f4f6", color: "#6b7280" }),
                }}>
                  {sale.metodo_pago || "—"}
                </span>
              </td>

              {/* Total */}
              <td className="px-6 py-4">
                <p className="font-semibold text-sm" style={{ color: "#1a3a2a" }}>
                  ${(sale.Total || 0).toLocaleString("es-CO")}
                </p>
                {sale.descuento > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: "#1a5c3a" }}>
                    -{sale.descuento.toLocaleString("es-CO")} desc.
                  </p>
                )}
              </td>

              {/* Fecha */}
              <td className="px-6 py-4">
                <p className="text-sm" style={{ color: "#1a3a2a" }}>{formatDate(sale.Fecha)}</p>
              </td>

              {/* Acciones */}
              <td className="px-6 py-4">
                <button onClick={() => onView(sale)} title="Ver detalle"
                  className="p-2 rounded-lg transition-colors" style={{ color: "#6b7c6b" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <Eye className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
