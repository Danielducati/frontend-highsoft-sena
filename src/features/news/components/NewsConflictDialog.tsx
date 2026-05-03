// news/components/NewsConflictDialog.tsx
import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "../../../shared/ui/alert-dialog";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button";
import { Label } from "../../../shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { AlertTriangle, CalendarX, CalendarCheck, UserRoundCog, ArrowLeft } from "lucide-react";
import { ConflictResponse, ConflictAction } from "../services/newsApi";
import { Employee } from "../types";

interface NewsConflictDialogProps {
  conflict:          ConflictResponse | null;
  employees:         Employee[];
  currentEmployeeId: string;
  onCancel:          () => void;
  onConfirm:         (action: ConflictAction) => void;
}

export function NewsConflictDialog({
  conflict, employees, currentEmployeeId, onCancel, onConfirm
}: NewsConflictDialogProps) {
  const [showReassign,     setShowReassign]     = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  if (!conflict) return null;

  const availableEmployees = employees.filter(e => String(e.id) !== currentEmployeeId);

  const handleReassignConfirm = () => {
    if (!selectedEmployee) return;
    onConfirm({ action: "reassign", reassignToEmployeeId: selectedEmployee });
    setShowReassign(false);
    setSelectedEmployee("");
  };

  return (
    <AlertDialog open={!!conflict} onOpenChange={onCancel}>
      <AlertDialogContent className="hl-form-dialog max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2" style={{ color: "#b45309" }}>
            <AlertTriangle className="w-5 h-5" />
            Conflicto de Citas
          </AlertDialogTitle>
          <AlertDialogDescription style={{ color: "#6b7c6b" }}>
            {conflict.message}. Elige cómo proceder:
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Lista de servicios — fondo beige del proyecto */}
        <div className="space-y-2 max-h-48 overflow-y-auto py-2">
          {conflict.servicios.map(s => (
            <div
              key={s.detalleId}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: "#F7F9FC", border: "1px solid #E5E7EB" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "#1a3a2a" }}>{s.clienteNombre}</p>
                <p className="text-xs" style={{ color: "#6b7c6b" }}>{s.servicio}</p>
              </div>
              <div className="text-right">
                <Badge className="text-xs" style={{ backgroundColor: "#ead8b1", color: "#92400e", border: "none" }}>
                  {s.fecha}
                </Badge>
                <p className="text-xs mt-1" style={{ color: "#6b7c6b" }}>{s.hora}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Panel reasignación — usa primary (#78d1bd) */}
        {showReassign && (
          <div className="space-y-2 p-3 rounded-lg" style={{ backgroundColor: "#edf7f4", border: "1px solid #c8ead9" }}>
            <Label className="text-sm" style={{ color: "#1a5c3a" }}>
              ¿A quién le asignamos estos servicios?
            </Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="bg-white" style={{ borderColor: "#c8ead9" }}>
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
                style={{ borderColor: "#E5E7EB", color: "#1a3a2a" }}
                onClick={() => { setShowReassign(false); setSelectedEmployee(""); }}
              >
                Cancelar
              </Button>
              <button
                type="button"
                onClick={handleReassignConfirm}
                disabled={!selectedEmployee}
                style={{
                  flex: 1, padding: "6px 12px", borderRadius: 8,
                  fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)",
                  color:           selectedEmployee ? "white"    : "#9ca3af",
                  backgroundColor: selectedEmployee ? "#78d1bd"  : "#e5e7eb",
                  cursor:          selectedEmployee ? "pointer"  : "not-allowed",
                  border: "none", transition: "background-color 0.2s",
                }}
                onMouseEnter={e => { if (selectedEmployee) (e.target as HTMLButtonElement).style.backgroundColor = "#5fbfaa"; }}
                onMouseLeave={e => { if (selectedEmployee) (e.target as HTMLButtonElement).style.backgroundColor = "#78d1bd"; }}
              >
                Confirmar reasignación
              </button>
            </div>
          </div>
        )}

        {/* Botones principales */}
        <div className="flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid #E5E7EB" }}>

          {/* Destructivo — --color-delete: #f87171 */}
          <button
            onClick={() => onConfirm({ action: "cancel" })}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px 16px", borderRadius: 10, border: "none",
              backgroundColor: "#f87171", color: "white",
              fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)", cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#ef4444")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#f87171")}
          >
            <CalendarX style={{ width: 16, height: 16 }} />
            Cancelar citas y registrar novedad
          </button>

          {/* Secundario — --color-purple: #a78bfa */}
          <button
            onClick={() => setShowReassign(true)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px 16px", borderRadius: 10,
              border: "1px solid #a78bfa", backgroundColor: "transparent",
              color: "#7c3aed", fontSize: 14, fontWeight: 600,
              fontFamily: "var(--font-body)", cursor: "pointer", transition: "background-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f3ff")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <UserRoundCog style={{ width: 16, height: 16 }} />
            Reasignar servicios a otro empleado
          </button>

          {/* Neutro — --primary: #78d1bd */}
          <button
            onClick={() => onConfirm({ action: "keep" })}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px 16px", borderRadius: 10,
              border: "1px solid #78d1bd", backgroundColor: "transparent",
              color: "#1a5c3a", fontSize: 14, fontWeight: 600,
              fontFamily: "var(--font-body)", cursor: "pointer", transition: "background-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#edf7f4")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <CalendarCheck style={{ width: 16, height: 16 }} />
            Registrar novedad sin cambiar citas
          </button>

          {/* Volver */}
          <button
            onClick={onCancel}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "8px", borderRadius: 8, border: "none",
              backgroundColor: "transparent", color: "#6b7c6b",
              fontSize: 14, fontFamily: "var(--font-body)", cursor: "pointer",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#1a3a2a")}
            onMouseLeave={e => (e.currentTarget.style.color = "#6b7c6b")}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Volver al formulario
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
