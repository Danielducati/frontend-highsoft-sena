import { Eye, Pencil, Trash2, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { EmployeeNews } from "../types";
import { getTypeConfig, getTypeColor, getStatusColor, getStatusLabel, formatDate } from "../utils";
// Importamos los componentes de Select para el estado interactivo
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";

interface NewsTableProps {
  news:           EmployeeNews[];
  userRole:       "admin" | "employee" | "client";
  onView:         (item: EmployeeNews) => void;
  onEdit:         (item: EmployeeNews) => void;
  onDelete:       (id: number) => void;
  // Cambiamos el nombre a uno más descriptivo para la acción directa
  onUpdateStatus: (id: number, status: string) => void; 
}

export function NewsTable({ news, userRole, onView, onEdit, onDelete, onUpdateStatus }: NewsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-gray-900 text-sm font-semibold">Empleado</th>
            <th className="px-4 py-3 text-left text-gray-900 text-sm font-semibold">Tipo</th>
            <th className="px-4 py-3 text-left text-gray-900 text-sm font-semibold">Fecha Inicio</th>
            <th className="px-4 py-3 text-left text-gray-900 text-sm font-semibold">Fecha Final</th>
            <th className="px-4 py-3 text-left text-gray-900 text-sm font-semibold">Hora</th>
            <th className="px-4 py-3 text-left text-gray-900 text-sm font-semibold">Status</th>
            <th className="px-4 py-3 text-center text-gray-900 text-sm font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {news.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center">
                <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No se encontraron novedades</p>
              </td>
            </tr>
          ) : news.map(item => {
            const cfg      = getTypeConfig(item.type);
            const TypeIcon = cfg.icon;

            return (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <TypeIcon className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} />
                    <p className="text-sm text-gray-900 font-medium">{item.employeeName}</p>
                  </div>
                </td>
                
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(item.type)}`}>
                    {cfg.label}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm">{formatDate(item.date)}</span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm">{formatDate(item.fechaFinal ?? "")}</span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  {item.startTime || item.endTime ? (
                    <div className="flex flex-col text-sm text-gray-700">
                      <span>{item.startTime}</span>
                      <span className="text-gray-400 text-xs">{item.endTime}</span>
                    </div>
                  ) : <span className="text-xs text-gray-400">—</span>}
                </td>

                {/* STATUS INTERACTIVO */}
                <td className="px-4 py-3">
                  {userRole === "admin" || userRole === "employee" ? (
                    <Select 
                      value={item.status} 
                      onValueChange={(value) => onUpdateStatus(item.id, value)}
                    >
                      <SelectTrigger className={`h-7 w-[120px] text-xs font-semibold rounded-full border-none shadow-none ${getStatusColor(item.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="aprobada">Aprobada</SelectItem>
                        <SelectItem value="rechazada">Rechazada</SelectItem>
                        <SelectItem value="resuelta">Resuelta</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onView(item)}
                      title="Ver detalles"
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: "#6b7c6b" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {(userRole === "admin" || userRole === "employee") && (
                      <button
                        onClick={() => onEdit(item)}
                        title="Editar"
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "#6b7c6b" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}

                    {userRole === "admin" && (
                      <button
                        onClick={() => onDelete(item.id)}
                        title="Eliminar"
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "#c0392b" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fdf0ee")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
