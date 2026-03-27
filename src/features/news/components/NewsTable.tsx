import { Badge } from "../../../shared/ui/badge";
import { Eye, Edit, Trash2, RefreshCw, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { EmployeeNews } from "../types";
import { getTypeConfig, getTypeColor, getStatusColor, getStatusLabel, formatDate } from "../utils";

interface NewsTableProps {
  news:           EmployeeNews[];
  userRole:       "admin" | "employee" | "client";
  onView:         (item: EmployeeNews) => void;
  onEdit:         (item: EmployeeNews) => void;
  onDelete:       (id: number) => void;
  onChangeStatus: (item: EmployeeNews) => void;
}

export function NewsTable({ news, userRole, onView, onEdit, onDelete, onChangeStatus }: NewsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-gray-900 text-sm">Empleado</th>
            <th className="px-4 py-3 text-left text-gray-900 text-sm">Tipo</th>
            <th className="px-4 py-3 text-left text-gray-900 text-sm">Fecha Inicio</th>
            <th className="px-4 py-3 text-left text-gray-900 text-sm">Fecha Final</th>
            <th className="px-4 py-3 text-left text-gray-900 text-sm">Hora</th>
            <th className="px-4 py-3 text-left text-gray-900 text-sm">Estado</th>
            <th className="px-4 py-3 text-center text-gray-900 text-sm">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {news.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center">
                <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No se encontraron novedades</p>
                <p className="text-sm text-gray-500 mt-1">Intenta ajustar los filtros</p>
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
                    <p className="text-sm text-gray-900">{item.employeeName}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`${getTypeColor(item.type)} text-xs px-2.5 py-0.5`}>
                    {cfg.label}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm text-gray-700">{formatDate(item.date)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm text-gray-700">{formatDate(item.fechaFinal ?? "")}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {item.startTime || item.endTime ? (
                    <div className="flex flex-col gap-0.5 text-sm text-gray-700">
                      {item.startTime && <span>{item.startTime}</span>}
                      {item.endTime   && <span className="text-gray-400">{item.endTime}</span>}
                    </div>
                  ) : <span className="text-xs text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3">
                  <Badge className={`${getStatusColor(item.status)} text-xs px-2.5 py-0.5`}>
                    {getStatusLabel(item.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => onView(item)}
                      className="p-1.5 hover:bg-[#60A5FA]/10 rounded-lg text-[#60A5FA] transition-all" title="Ver">
                      <Eye className="w-4 h-4" />
                    </button>
                    {(userRole === "admin" || userRole === "employee") && (
                      <>
                        <button onClick={() => onChangeStatus(item)}
                          className="p-1.5 hover:bg-[#A78BFA]/10 rounded-lg text-[#A78BFA] transition-all" title="Cambiar estado">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button onClick={() => onEdit(item)}
                          className="p-1.5 hover:bg-[#FBBF24]/10 rounded-lg text-[#FBBF24] transition-all" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        {userRole === "admin" && (
                          <button onClick={() => onDelete(item.id)}
                            className="p-1.5 hover:bg-[#F87171]/10 rounded-lg text-[#F87171] transition-all" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
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
