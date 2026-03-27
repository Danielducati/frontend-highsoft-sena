// news/components/NewsConflictDialog.tsx

import React, { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "../../../shared/ui/alert-dialog";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button";
import { Label } from "../../../shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { AlertTriangle, CalendarX, CalendarCheck, UserRoundCog, ArrowLeft } from "lucide-react";
import { ConflictResponse, ConflictAction } from "../services/newsApi";
import { Employee } from "../types";

interface NewsConflictDialogProps {
  conflict:   ConflictResponse | null;
  employees:  Employee[];
  currentEmployeeId: string; // para excluirlo del select
  onCancel:   () => void;
  onConfirm:  (action: ConflictAction) => void;
}

export function NewsConflictDialog({
  conflict, employees, currentEmployeeId, onCancel, onConfirm
}: NewsConflictDialogProps) {
  const [showReassign,     setShowReassign]     = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  if (!conflict) return null;

  // Empleados disponibles — excluye al que tiene la novedad
  const availableEmployees = employees.filter(e => String(e.id) !== currentEmployeeId);

  const handleReassignConfirm = () => {
    if (!selectedEmployee) return;
    onConfirm({ action: "reassign", reassignToEmployeeId: selectedEmployee });
    setShowReassign(false);
    setSelectedEmployee("");
  };

  return (
    <AlertDialog open={!!conflict} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            Conflicto de Citas
          </AlertDialogTitle>
          <AlertDialogDescription>
            {conflict.message}. Elige cómo proceder:
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Servicios en conflicto */}
        <div className="space-y-2 max-h-48 overflow-y-auto py-2">
          {conflict.servicios.map(s => (
            <div key={s.detalleId} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">{s.clienteNombre}</p>
                <p className="text-xs text-gray-500">{s.servicio}</p>
              </div>
              <div className="text-right">
                <Badge className="bg-amber-100 text-amber-700 text-xs">{s.fecha}</Badge>
                <p className="text-xs text-gray-500 mt-1">{s.hora}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Select de reasignación — aparece al elegir esa opción */}
        {showReassign && (
          <div className="space-y-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <Label className="text-sm text-purple-800">
              ¿A quién le asignamos estos servicios?
            </Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="bg-white border-purple-200">
                <SelectValue placeholder="Elige un empleado..." />
              </SelectTrigger>
              <SelectContent>
                {availableEmployees.map(emp => (
                  <SelectItem key={emp.id} value={String(emp.id)}>
                    {emp.name} {emp.specialty && `— ${emp.specialty}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => { setShowReassign(false); setSelectedEmployee(""); }}
              >
                Cancelar
              </Button>
              <button
                type="button"
                onClick={handleReassignConfirm}
                disabled={!selectedEmployee}
                style={{
                  flex: 1,
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: selectedEmployee ? "white" : "#6b7280",
                  backgroundColor: selectedEmployee ? "#9333ea" : "#e5e7eb",
                  cursor: selectedEmployee ? "pointer" : "not-allowed",
                  border: selectedEmployee ? "none" : "1px solid #d1d5db",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={e => { if (selectedEmployee) (e.target as HTMLButtonElement).style.backgroundColor = "#7e22ce"; }}
                onMouseLeave={e => { if (selectedEmployee) (e.target as HTMLButtonElement).style.backgroundColor = "#9333ea"; }}
              >
                Confirmar reasignación
              </button>
            </div>
          </div>
        )}

        {/* Botones principales */}
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <Button
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            onClick={() => onConfirm({ action: "cancel" })}
          >
            <CalendarX className="w-4 h-4 mr-1.5" />
            Cancelar citas y registrar novedad
          </Button>

          <Button
            variant="outline"
            className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
            onClick={() => setShowReassign(true)}
          >
            <UserRoundCog className="w-4 h-4 mr-1.5" />
            Reasignar servicios a otro empleado
          </Button>

          <Button
            variant="outline"
            className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={() => onConfirm({ action: "keep" })}
          >
            <CalendarCheck className="w-4 h-4 mr-1.5" />
            Registrar novedad sin cambiar citas
          </Button>

          <Button
            variant="ghost"
            className="w-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            onClick={onCancel}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Volver al formulario
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}