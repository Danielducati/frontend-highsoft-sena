//frontend-highsoft-sena\src\features\appointments\components\AppointmentFormDialog.tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Textarea } from "../../../shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Plus, X, Clock, User, CalendarIcon } from "lucide-react";
import { Appointment, AppointmentService, Client, CurrentService, Employee, FormData, Service } from "../types";
import { calculateEndTime } from "../utils";
import { TIME_SLOTS } from "../constants";

interface Props {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  editingAppointment: Appointment | null;
  formData: FormData;
  setFormData: (d: FormData) => void;
  selectedServices: AppointmentService[];
  currentService: CurrentService;
  setCurrentService: (s: CurrentService) => void;
  services: Service[];
  employees: Employee[];
  clients: Client[];
  getEmployeesByCategory: (cat: string) => Employee[];
  onAddService: () => void;
  onRemoveService: (i: number) => void;
  onClientChange: (id: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  userRole?: string;
}

export function AppointmentFormDialog({
  isOpen, onOpenChange, editingAppointment, formData, setFormData,
  selectedServices, currentService, setCurrentService,
  services, employees, clients, getEmployeesByCategory,
  onAddService, onRemoveService, onClientChange, onSubmit, onCancel, userRole,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="hl-form-dialog max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#A78BFA]" />
            {editingAppointment ? "Editar Cita" : "Nueva Cita"}
          </DialogTitle>
          <DialogDescription>
            {editingAppointment ? "Actualiza la información de la cita" : "Programa una nueva cita"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {formData.date && formData.startTime && !editingAppointment && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-[#A78BFA]/10 to-[#78D1BD]/10 border border-[#A78BFA]/30">
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <CalendarIcon className="w-4 h-4 text-[#A78BFA]" />
                <span className="capitalize">
                  {formData.date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                </span>
                <span className="text-gray-400">•</span>
                <Clock className="w-4 h-4 text-[#78D1BD]" />
                <span>{formData.startTime}</span>
              </div>
            </div>
          )}

          {/* Cliente */}
          <div className="space-y-2">
            <Label>Cliente *</Label>
            {userRole === "client" ? (
              <div className="h-10 px-3 flex items-center rounded-md border border-input bg-[#edf7f4] text-sm font-medium text-[#1a5c3a]">
                {formData.clientName
                  ? formData.clientName
                  : clients.length > 0
                    ? clients[0].name
                    : <span className="text-gray-400 font-normal">Cargando perfil...</span>
                }
              </div>
            ) : (
              <Select value={formData.clientId} onValueChange={onClientChange}>
                <SelectTrigger><SelectValue placeholder="Selecciona un cliente" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      <div className="flex flex-col">
                        <span>{c.name}</span>
                        <span className="text-xs text-gray-500">{c.phone}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Input type="date"
                min={new Date().toISOString().split("T")[0]}
                value={formData.date.toISOString().split("T")[0]}
                onChange={e => setFormData({ ...formData, date: new Date(e.target.value + "T00:00:00") })} />
            </div>
            <div className="space-y-2">
              <Label>Hora de Inicio *</Label>
              <Select value={formData.startTime} onValueChange={v => setFormData({ ...formData, startTime: v })}>
                <SelectTrigger><SelectValue placeholder="Selecciona hora" /></SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Servicios */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-gray-900">Agregar Servicios</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Servicio</Label>
                <Select value={currentService.serviceId}
                  onValueChange={v => setCurrentService({ serviceId: v, employeeId: "" })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona servicio" /></SelectTrigger>
                  <SelectContent>
                    {services.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        <div className="flex flex-col">
                          <span>{s.name}</span>
                          <span className="text-xs text-gray-500">{s.category} • {s.duration} min</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Empleado</Label>
                <Select value={currentService.employeeId}
                  onValueChange={v => setCurrentService({ ...currentService, employeeId: v })}
                  disabled={!currentService.serviceId}>
                  <SelectTrigger><SelectValue placeholder="Selecciona empleado" /></SelectTrigger>
                  <SelectContent>
                    {employees.length === 0 ? (
                      <SelectItem value="empty" disabled>No hay empleados</SelectItem>
                    ) : getEmployeesByCategory(
                        services.find(s => s.id === currentService.serviceId)?.category ?? ""
                      ).map(e => (
                        <SelectItem key={e.id} value={e.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
                            <span>{e.name}</span>
                            {e.specialty && <span className="text-xs text-gray-400">• {e.specialty}</span>}
                          </div>
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="button" onClick={onAddService} variant="default"
              className="w-full"
              disabled={!formData.startTime}>
              <Plus className="w-4 h-4 mr-2" />Agregar Servicio
            </Button>

            {selectedServices.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-xs text-gray-600">Servicios agregados:</p>
                {selectedServices.map((s, i) => {
                  const emp = employees.find(e => e.id === s.employeeId);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border-l-4"
                      style={{ borderLeftColor: emp?.color ?? "#ccc" }}>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{s.serviceName}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{s.employeeName}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {s.startTime} - {calculateEndTime(s.startTime, s.duration)} ({s.duration} min)
                          </span>
                        </div>
                      </div>
                      <button onClick={() => onRemoveService(i)} className="p-1 hover:bg-red-50 rounded text-[#F87171]">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    Duración total: {selectedServices.reduce((sum, s) => sum + s.duration, 0)} min
                    {formData.startTime && ` • Finaliza: ${calculateEndTime(
                      formData.startTime,
                      selectedServices.reduce((sum, s) => sum + s.duration, 0)
                    )}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label>Notas (opcional)</Label>
            <Textarea value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Preferencias del cliente, alergias, etc." rows={3} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button variant="default" onClick={onSubmit}
              // className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white"
              >
              {editingAppointment ? "Actualizar" : "Crear"} Cita
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
