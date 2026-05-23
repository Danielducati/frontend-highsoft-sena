// components/NewsAppointmentConflictDialog.tsx
import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../shared/ui/alert-dialog";
import { Button } from "../../../shared/ui/button";
import { Label } from "../../../shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Badge } from "../../../shared/ui/badge";
import { AlertTriangle, Calendar, Clock, User, Phone, Mail, X } from "lucide-react";
import { ApprovalConflictResponse, ConflictAction } from "../services/newsApi";

interface NewsAppointmentConflictDialogProps {
  open:       boolean;
  conflict:   ApprovalConflictResponse | null;
  onResolve:  (action: ConflictAction) => void;
  onCancel:   () => void;
}

export function NewsAppointmentConflictDialog({ open, conflict, onResolve, onCancel }: NewsAppointmentConflictDialogProps) {
  const [selectedAction, setSelectedAction] = useState<string>("cancel");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  if (!conflict) return null;

  const handleConfirm = () => {
    if (selectedAction === "cancel") {
      onResolve({ action: "cancel" });
    } else if (selectedAction === "reassign") {
      if (!selectedEmployeeId) {
        alert("Debes seleccionar un empleado para reasignar");
        return;
      }
      onResolve({ action: "reassign", reassignToEmployeeId: selectedEmployeeId });
    } else if (selectedAction === "keep") {
      onResolve({ action: "keep" });
    }
  };

  const selectedOption = conflict.opciones.find(o => o.action === selectedAction);

  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            Conflicto con Citas Existentes
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta novedad afecta citas ya programadas. Debes decidir qué hacer con ellas antes de aprobar.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Información de la novedad */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Novedad a Aprobar</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Empleado:</span>
              <p className="font-medium text-gray-900">{conflict.novedad.empleado}</p>
            </div>
            <div>
              <span className="text-gray-600">Tipo:</span>
              <p className="font-medium text-gray-900 capitalize">{conflict.novedad.tipo}</p>
            </div>
            <div>
              <span className="text-gray-600">Fecha:</span>
              <p className="font-medium text-gray-900">
                {conflict.novedad.fechaInicio}
                {conflict.novedad.fechaFinal !== conflict.novedad.fechaInicio && ` - ${conflict.novedad.fechaFinal}`}
              </p>
            </div>
            {conflict.novedad.horaInicio && conflict.novedad.horaFinal && (
              <div>
                <span className="text-gray-600">Horario:</span>
                <p className="font-medium text-gray-900">
                  {conflict.novedad.horaInicio} - {conflict.novedad.horaFinal}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Citas afectadas */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Citas Afectadas ({conflict.citasAfectadas.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {conflict.citasAfectadas.map((cita) => (
              <div key={cita.detalleId} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{cita.cliente}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {cita.fecha}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {cita.hora}
                      </div>
                    </div>
                    <div className="text-sm">
                      <Badge variant="outline" className="text-xs">
                        {cita.servicio}
                      </Badge>
                    </div>
                    {(cita.clienteContacto.correo || cita.clienteContacto.telefono) && (
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        {cita.clienteContacto.correo && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {cita.clienteContacto.correo}
                          </div>
                        )}
                        {cita.clienteContacto.telefono && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {cita.clienteContacto.telefono}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opciones de resolución */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-900">¿Qué deseas hacer?</Label>
          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {conflict.opciones.map((option) => (
                <SelectItem key={option.action} value={option.action}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedOption && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">{selectedOption.description}</p>
            </div>
          )}

          {/* Selector de empleado para reasignación */}
          {selectedAction === "reassign" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Seleccionar Empleado</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecciona un empleado..." />
                </SelectTrigger>
                <SelectContent>
                  {conflict.empleadosDisponibles.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.nombre} {emp.especialidad && `— ${emp.especialidad}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-gradient-to-r from-[#1a5c3a] to-[#1a3a2a] hover:from-[#164d31] hover:to-[#132e22]"
          >
            Confirmar y Aprobar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
