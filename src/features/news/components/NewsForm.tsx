//components/NewsForm.tsx
import { useState, useEffect } from "react";
import { Label } from "../../../shared/ui/label";
import { Textarea } from "../../../shared/ui/textarea";
import { Button } from "../../../shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Badge } from "../../../shared/ui/badge";
import { Checkbox } from "../../../shared/ui/checkbox";
import { Alert, AlertDescription } from "../../../shared/ui/alert";
import { 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Tag, 
  ChevronLeft, 
  ChevronRight,
  Info,
  AlertCircle
} from "lucide-react";

import { NEWS_TYPES, TIME_SLOTS } from "../constants";
import { Employee, EmployeeNews, NewsFormData } from "../types";

interface NewsFormProps {
  formData:    NewsFormData;
  setFormData: React.Dispatch<React.SetStateAction<NewsFormData>>;
  employees:   Employee[];
  editingNews: EmployeeNews | null;
  onSubmit:    () => void;
  onCancel:    () => void;
  loggedEmployeeId?: string | null;
  userRole?: string;
}

// Mock data para horarios semanales (temporal hasta integrar con backend)
const mockEmployeeSchedules = {
  "1": {
    name: "Juan Pérez",
    schedule: [
      { day: 0, name: "Lunes", short: "Lun", hours: "08:00-17:00", available: true },
      { day: 1, name: "Martes", short: "Mar", hours: "08:00-17:00", available: true },
      { day: 2, name: "Miércoles", short: "Mié", hours: "08:00-17:00", available: true },
      { day: 3, name: "Jueves", short: "Jue", hours: "08:00-17:00", available: true },
      { day: 4, name: "Viernes", short: "Vie", hours: "08:00-17:00", available: true },
      { day: 5, name: "Sábado", short: "Sáb", hours: "", available: false },
      { day: 6, name: "Domingo", short: "Dom", hours: "", available: false },
    ]
  },
  "2": {
    name: "María García",
    schedule: [
      { day: 0, name: "Lunes", short: "Lun", hours: "09:00-18:00", available: true },
      { day: 1, name: "Martes", short: "Mar", hours: "09:00-18:00", available: true },
      { day: 2, name: "Miércoles", short: "Mié", hours: "09:00-18:00", available: true },
      { day: 3, name: "Jueves", short: "Jue", hours: "09:00-18:00", available: true },
      { day: 4, name: "Viernes", short: "Vie", hours: "09:00-18:00", available: true },
      { day: 5, name: "Sábado", short: "Sáb", hours: "08:00-14:00", available: true },
      { day: 6, name: "Domingo", short: "Dom", hours: "", available: false },
    ]
  },
  "3": {
    name: "Carlos López",
    schedule: [
      { day: 0, name: "Lunes", short: "Lun", hours: "", available: false },
      { day: 1, name: "Martes", short: "Mar", hours: "14:00-22:00", available: true },
      { day: 2, name: "Miércoles", short: "Mié", hours: "14:00-22:00", available: true },
      { day: 3, name: "Jueves", short: "Jue", hours: "14:00-22:00", available: true },
      { day: 4, name: "Viernes", short: "Vie", hours: "14:00-22:00", available: true },
      { day: 5, name: "Sábado", short: "Sáb", hours: "14:00-22:00", available: true },
      { day: 6, name: "Domingo", short: "Dom", hours: "14:00-22:00", available: true },
    ]
  }
};

export function NewsForm({ formData, setFormData, employees, editingNews, onSubmit, onCancel, loggedEmployeeId, userRole }: NewsFormProps) {
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
    // Obtener el lunes de la semana actual
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    return monday.toISOString().split('T')[0];
  });
  
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [affectationType, setAffectationType] = useState<"full_day" | "partial_hours">("full_day");
  const [employeeSchedule, setEmployeeSchedule] = useState<any>(null);

  // Obtener rol del usuario desde localStorage
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const rolNorm = (usuario.rol ?? "").toLowerCase();
  const isEmployee = rolNorm === "empleado" || rolNorm === "barbero";

  console.log('👤 Usuario:', usuario);
  console.log('🎭 Rol normalizado:', rolNorm);
  console.log('✅ Es empleado?:', isEmployee);
  console.log('🆔 loggedEmployeeId:', loggedEmployeeId);

  // Si es empleado y no hay formData.employeeId, establecer el empleado logueado
  useEffect(() => {
    if (isEmployee && loggedEmployeeId && !formData.employeeId && !editingNews) {
      const emp = employees.find(e => String(e.id) === loggedEmployeeId);
      if (emp) {
        console.log('🔧 Estableciendo empleado:', emp);
        setFormData(prev => ({ ...prev, employeeId: String(emp.id), employeeName: emp.name }));
        setEmployeeSchedule(mockEmployeeSchedules[loggedEmployeeId as keyof typeof mockEmployeeSchedules] || null);
      }
    }
  }, [isEmployee, loggedEmployeeId, employees, formData.employeeId, editingNews, setFormData]);

  const handleEmployeeChange = (empId: string) => {
    const emp = employees.find(e => String(e.id) === empId);
    if (emp) {
      setFormData(prev => ({ ...prev, employeeId: String(emp.id), employeeName: emp.name }));
    }
  };

  const handleWeekNavigation = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedWeekStart);
    const offset = direction === 'prev' ? -7 : 7;
    currentDate.setDate(currentDate.getDate() + offset);
    setSelectedWeekStart(currentDate.toISOString().split('T')[0]);
  };

  const getWeekRangeLabel = () => {
    const startDate = new Date(selectedWeekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return `${startDate.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short' 
    })} - ${endDate.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    })}`;
  };

  const getDayBadgeColor = (dayIndex: number) => {
    const colors = [
      "bg-[#1a5c3a]/20 text-[#1a5c3a] border-[#1a5c3a]/30", // Lunes
      "bg-[#60A5FA]/20 text-[#60A5FA] border-[#60A5FA]/30", // Martes
      "bg-[#FBBF24]/20 text-[#1a5c3a] border-[#FBBF24]/30", // Miércoles
      "bg-[#F87171]/20 text-[#F87171] border-[#F87171]/30", // Jueves
      "bg-[#78D1BD]/20 text-[#1a5c3a] border-[#78D1BD]/30", // Viernes
      "bg-[#1a5c3a]/20 text-[#1a5c3a] border-[#1a5c3a]/30", // Sábado
      "bg-[#60A5FA]/20 text-[#60A5FA] border-[#60A5FA]/30", // Domingo
    ];
    return colors[dayIndex] || colors[0];
  };

  // Actualizar horarios cuando cambie el tipo de afectación
  useEffect(() => {
    if (affectationType === "full_day") {
      setFormData(prev => ({ ...prev, startTime: "", endTime: "" }));
    }
  }, [affectationType, setFormData]);

  // Validar si la fecha seleccionada cae en un día laboral del empleado
  const isDateWorkingDay = (dateStr: string) => {
    if (!dateStr || !employeeSchedule) return true;
    
    // Parseamos la fecha (agregamos T00:00:00 para evitar desajustes por zona horaria)
    const d = new Date(`${dateStr}T00:00:00`);
    
    // getDay(): Dom=0, Lun=1... Sab=6
    // Nuestro index: Lun=0, Mar=1... Dom=6
    const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
    
    const scheduleDay = employeeSchedule.schedule.find((s: any) => s.day === dayIndex);
    return scheduleDay ? scheduleDay.available : false;
  };

  const isStartDateValid = isDateWorkingDay(formData.date);

  // Validación: la fecha final no puede ser anterior a la fecha de inicio
  const isEndDateInvalid =
    !!formData.date &&
    !!formData.fechaFinal &&
    formData.fechaFinal < formData.date;

  return (
    <div className="space-y-6">
      {/* Selección de Empleado - Solo visible para admin */}
      {!isEmployee && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#1a5c3a]" />
            Empleado *
          </Label>
          <Select
            value={formData.employeeId || "placeholder"}
            onValueChange={v => { if (v !== "placeholder") handleEmployeeChange(v); }}
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Selecciona un empleado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="placeholder" disabled>Selecciona un empleado</SelectItem>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={String(emp.id)}>
                  {emp.name} {emp.specialty && `— ${emp.specialty}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Mostrar nombre del empleado si es empleado logueado */}
      {isEmployee && formData.employeeName && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#1a5c3a]" />
            Empleado
          </Label>
          <div className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm items-center">
            {formData.employeeName}
          </div>
        </div>
      )}

      {/* Tipo de Novedad */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#1a5c3a]" />
          Tipo de Novedad *
        </Label>
        <Select
          value={formData.type}
          onValueChange={(v: any) => setFormData(prev => ({ ...prev, type: v }))}
        >
          <SelectTrigger className="border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NEWS_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fechas de Novedad - Siempre visible */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#1a5c3a]" />
            Fecha Inicial *
          </Label>
          <input
            type="date"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.date || ""}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => {
              const newDate = e.target.value;
              setFormData(prev => {
                // Si la fecha final es anterior a la nueva fecha inicial, limpiarla
                if (prev.fechaFinal && newDate > prev.fechaFinal) {
                  return { ...prev, date: newDate, fechaFinal: "" };
                }
                return { ...prev, date: newDate };
              });
            }}
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#1a5c3a]" />
            Fecha Final
          </Label>
          <input
            type="date"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.fechaFinal || ""}
            min={formData.date || new Date().toISOString().split('T')[0]}
            onChange={e => setFormData(prev => ({ ...prev, fechaFinal: e.target.value }))}
            disabled={!formData.date}
          />
        </div>
      </div>

      {/* Tipo de Afectación */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Tipo de Afectación:</Label>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="full_day"
              name="affectationType"
              value="full_day"
              checked={affectationType === 'full_day'}
              onChange={(e) => setAffectationType(e.target.value as any)}
              className="text-[#1a5c3a]"
            />
            <label htmlFor="full_day" className="text-sm">
              Día completo (toda la jornada laboral)
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="partial_hours"
              name="affectationType"
              value="partial_hours"
              checked={affectationType === 'partial_hours'}
              onChange={(e) => setAffectationType(e.target.value as any)}
              className="text-[#1a5c3a]"
            />
            <label htmlFor="partial_hours" className="text-sm">
              Horario específico (seleccionar horas)
            </label>
          </div>
        </div>
      </div>

      {/* Selección de Horarios (solo si es parcial) */}
      {affectationType === 'partial_hours' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1a5c3a]" />
              Hora Inicio *
            </Label>
            <Select
              value={formData.startTime || "placeholder"}
              onValueChange={v => { 
                if (v !== "placeholder") {
                  setFormData(prev => {
                    // Si la hora final es anterior o igual a la nueva hora inicial, limpiarla
                    if (prev.endTime && v >= prev.endTime) {
                      return { ...prev, startTime: v, endTime: "" };
                    }
                    return { ...prev, startTime: v };
                  });
                }
              }}
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Selecciona hora" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder" disabled>Selecciona hora</SelectItem>
                {TIME_SLOTS.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1a5c3a]" />
              Hora Final *
            </Label>
            <Select
              value={formData.endTime || "placeholder"}
              onValueChange={v => { 
                if (v !== "placeholder") setFormData(prev => ({ ...prev, endTime: v })); 
              }}
              disabled={!formData.startTime}
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Selecciona hora" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder" disabled>Selecciona hora</SelectItem>
                {TIME_SLOTS.filter(t => !formData.startTime || t > formData.startTime).map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Resumen de Selección */}
      {formData.date && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Resumen de la novedad:</p>
              <p>
                <strong>Fechas:</strong> {formData.date} {formData.fechaFinal ? `al ${formData.fechaFinal}` : ''}
              </p>
              {formData.startTime && formData.endTime && (
                <p>
                  <strong>Horario:</strong> {formData.startTime} - {formData.endTime}
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Descripción */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#1a5c3a]" />
          Descripción *
        </Label>
        <Textarea
          rows={4}
          className="border-gray-300 resize-none"
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe la situación con el mayor detalle posible..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          variant="default" 
          onClick={onSubmit}
          disabled={
            !formData.date || 
            !formData.description.trim() || 
            (affectationType === 'partial_hours' && (!formData.startTime || !formData.endTime)) ||
            (!isEmployee && !formData.employeeId)
          }
        >
          {editingNews ? "Actualizar" : "Crear"} Novedad
        </Button>
      </div>
    </div>
  );
}