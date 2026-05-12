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
  Info
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

export function NewsForm({ formData, setFormData, employees, editingNews, onSubmit, onCancel }: NewsFormProps) {
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

  const handleEmployeeChange = (empId: string) => {
    const emp = employees.find(e => String(e.id) === empId);
    if (emp) {
      setFormData(prev => ({ ...prev, employeeId: String(emp.id), employeeName: emp.name }));
      setEmployeeSchedule(mockEmployeeSchedules[empId as keyof typeof mockEmployeeSchedules] || null);
      setSelectedDays([]);
    }
  };

  const handleWeekNavigation = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedWeekStart);
    const offset = direction === 'prev' ? -7 : 7;
    currentDate.setDate(currentDate.getDate() + offset);
    setSelectedWeekStart(currentDate.toISOString().split('T')[0]);
  };

  const handleDayToggle = (dayIndex: number) => {
    const isSelected = selectedDays.includes(dayIndex);
    const newSelectedDays = isSelected
      ? selectedDays.filter(d => d !== dayIndex)
      : [...selectedDays, dayIndex];
    
    setSelectedDays(newSelectedDays);
    
    // Actualizar formData con la primera fecha seleccionada
    if (newSelectedDays.length > 0) {
      const firstDayIndex = Math.min(...newSelectedDays);
      const weekStart = new Date(selectedWeekStart);
      const selectedDate = new Date(weekStart);
      selectedDate.setDate(weekStart.getDate() + firstDayIndex);
      
      setFormData(prev => ({ 
        ...prev, 
        date: selectedDate.toISOString().split('T')[0],
        fechaFinal: newSelectedDays.length > 1 ? 
          (() => {
            const lastDayIndex = Math.max(...newSelectedDays);
            const lastDate = new Date(weekStart);
            lastDate.setDate(weekStart.getDate() + lastDayIndex);
            return lastDate.toISOString().split('T')[0];
          })() : ""
      }));
    }
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

  return (
    <div className="space-y-6">
      {/* Selección de Empleado */}
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

      {/* Horario Semanal del Empleado */}
      {formData.employeeId && employeeSchedule && (
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4 text-[#1a5c3a]" />
              Horario Semanal - {employeeSchedule.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Navegación de Semana */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleWeekNavigation('prev')}
                className="h-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">
                  {getWeekRangeLabel()}
                </p>
                <p className="text-xs text-gray-500">
                  Semana del {selectedWeekStart}
                </p>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleWeekNavigation('next')}
                className="h-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Días de la Semana */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Selecciona los días afectados por la novedad:
              </Label>
              
              {employeeSchedule.schedule.map((day: any) => (
                <div key={day.day} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`day-${day.day}`}
                      checked={selectedDays.includes(day.day)}
                      onCheckedChange={() => handleDayToggle(day.day)}
                      disabled={!day.available}
                    />
                    
                    <label 
                      htmlFor={`day-${day.day}`}
                      className={`flex items-center gap-2 cursor-pointer select-none ${
                        !day.available ? 'opacity-50' : ''
                      }`}
                    >
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getDayBadgeColor(day.day)}`}
                      >
                        {day.short}
                      </Badge>
                      
                      <span className="text-sm font-medium">
                        {day.name}
                      </span>
                      
                      {day.available ? (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          {day.hours}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Sin horario</span>
                      )}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tipo de Afectación */}
      {selectedDays.length > 0 && (
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
      )}

      {/* Selección de Horarios (solo si es parcial) */}
      {affectationType === 'partial_hours' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1a5c3a]" />
              Hora Inicio
            </Label>
            <Select
              value={formData.startTime || "placeholder"}
              onValueChange={v => { 
                if (v !== "placeholder") setFormData(prev => ({ ...prev, startTime: v })); 
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
              Hora Final
            </Label>
            <Select
              value={formData.endTime || "placeholder"}
              onValueChange={v => { 
                if (v !== "placeholder") setFormData(prev => ({ ...prev, endTime: v })); 
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
        </div>
      )}

      {/* Resumen de Selección */}
      {selectedDays.length > 0 && employeeSchedule && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Resumen de la novedad:</p>
              <p>
                <strong>Días afectados:</strong> {
                  selectedDays
                    .map(dayIndex => employeeSchedule.schedule[dayIndex]?.name)
                    .join(', ')
                }
              </p>
              {affectationType === 'partial_hours' && formData.startTime && formData.endTime && (
                <p>
                  <strong>Horario:</strong> {formData.startTime} - {formData.endTime}
                </p>
              )}
              <p>
                <strong>Tipo:</strong> {
                  affectationType === 'full_day' ? 'Día completo' : 'Horario específico'
                }
              </p>
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
          disabled={selectedDays.length === 0 || !formData.description.trim()}
        >
          {editingNews ? "Actualizar" : "Crear"} Novedad
        </Button>
      </div>
    </div>
  );
}