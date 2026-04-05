import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Clock, User, Trash2, Edit, CalendarIcon } from "lucide-react";
import { Appointment, Employee } from "../types";
import { getStatusColor, getStatusLabel } from "../utils";
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from "react";

interface Props {
  appointment: Appointment | null;
  employees: Employee[];
  userRole: string;
  onClose: () => void;
  onEdit: (apt: Appointment) => void;
  onDeleteRequest: (id: number) => void;
  onUpdateStatus: (id: number, status: Appointment["status"]) => void;
}

export function AppointmentViewDialog({
  appointment: apt, employees, userRole, onClose, onEdit, onDeleteRequest, onUpdateStatus,
}: Props) {
  return (
    <Dialog open={!!apt} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#78D1BD]" />Detalles de la Cita
          </DialogTitle>
          <DialogDescription>Información completa de la cita programada</DialogDescription>
        </DialogHeader>

        {apt && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <h3 className="text-gray-900 mb-1">Cliente</h3>
              <p className="text-sm text-gray-700">{apt.clientName}</p>
              <p className="text-xs text-gray-600 mt-0.5">{apt.clientPhone}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600">Fecha</p>
                <p className="text-sm text-gray-900 capitalize">
                  {apt.date.toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Horario</p>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#78D1BD]" />
                  <p className="text-sm text-gray-900">{apt.startTime} - {apt.endTime}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-2">Servicios</p>
              <div className="space-y-2">
                {apt.services.map((s: { employeeId: any; serviceName: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; duration: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; employeeName: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, i: Key | null | undefined) => {
                  const emp = employees.find(e => e.id === s.employeeId);
                  return (
                    <div key={i} className="p-3 rounded-lg border-l-4 bg-gray-50"
                      style={{ borderLeftColor: emp?.color ?? "#ccc" }}>
                      <div className="flex justify-between mb-1">
                        <p className="text-sm text-gray-900">{s.serviceName}</p>
                        <span className="text-xs text-gray-600">{s.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <User className="w-3 h-3" /><span>{s.employeeName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-2">Estado</p>
              <div className="flex gap-2 flex-wrap">
                {(["pending", "completed", "cancelled"] as const).map(s => (
                  <button key={s}
                    onClick={() => onUpdateStatus(apt.id, s)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      apt.status === s
                        ? getStatusColor(s) + " ring-2 ring-offset-2"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    {getStatusLabel(s)}
                  </button>
                ))}
              </div>
            </div>

            {apt.notes && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Notas</p>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-900">{apt.notes}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              {userRole === "admin" && (
                <Button variant="outline"
                  onClick={() => { onDeleteRequest(apt.id); onClose(); }}
                  className="border-[#F87171] text-[#F87171] hover:bg-[#F87171]/10">
                  <Trash2 className="w-4 h-4 mr-2" />Eliminar
                </Button>
              )}
              <Button variant="outline"
                onClick={() => { onEdit(apt); onClose(); }}
                className="border-[#FBBF24] text-[#FBBF24] hover:bg-[#FBBF24]/10">
                <Edit className="w-4 h-4 mr-2" />Editar
              </Button>
              <Button onClick={onClose} className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] text-white">
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
