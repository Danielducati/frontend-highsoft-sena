// src/features/news/components/NewsFormV2.tsx
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
  AlertTriangle,
  Info,
  CheckCircle
} from "lucide-react";

import { NEWS_TYPES, TIME_SLOTS } from "../constants";
import { Employee } from "../types";
import { NewsFormDataV2, WeekDay, EmployeeSchedule } from "../types/schedule";
import { scheduleService } from "../services/scheduleService";

interface NewsFormV2Props {
  formData: NewsFormDataV2;
  setFormData: React.Dispatch<React.SetStateAction<NewsFormDataV2>>;
  employees: Employee[];
  editingNews: any | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export function NewsFormV2({ 
  formData, 
  setFormData, 
  employees, 
  editingNews, 
  onSubmit, 
  onCancel 
}: NewsFormV2Props) {
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [employeeSchedule, setEmployeeSchedule] = useState<EmployeeSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[]; warnings: string[] }>({
    isValid: true,
    errors: [],
    warnings: []
  });

  // Cargar horario del empleado cuando cambie la selección
  useEffect(() => {
    if (formData.employeeId && formData.selectedWeekStart) {
      loadEmployeeSchedule();
    }
  }, [formData.employeeId, formData.selectedWeekStart]);

  // Validar selección cuando cambien los días o horarios
  useEffect(() => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!formData.date) {
      errors.push("Debe seleccionar una Fecha Inicial");
    }
    
    if (formData.affectationType === 'partial_hours') {
      if (!formData.startTime || !formData.endTime) {
        errors.push("Debe seleccionar hora de inicio y fin");
      } else if (formData.startTime >= formData.endTime) {
        errors.push("La hora de inicio debe ser menor que la hora de fin");
      }
    }
    
    setValidation({
      isValid: errors.length === 0,
      errors,
      warnings
    });
  }, [formData.date, formData.affectationType, formData.startTime, formData.endTime]);

  const loadEmployeeSchedule = async () => {
    setLoading(true);
    try {
      const schedule = await scheduleService.getWeekSchedule(
        formData.employeeId, 
        formData.selectedWeekStart
      );
      
      setEmployeeSchedule(schedule);
      
      const days = scheduleService.generateWeekDays(formData.selectedWeekStart, schedule || undefined);
      setWeekDays(days);
      
      // Limpiar días seleccionados si no están disponibles
      const availableDayIndices = days.filter(d => d.available).map(d => d.dayIndex);
      const validSelectedDays = formData.selectedDays.filter(dayIndex => 
        availableDayIndices.includes(dayIndex)
      );
      
      if (validSelectedDays.length !== formData.selectedDays.length) {
        setFormData(prev => ({ ...prev, selectedDays: validSelectedDays }));
      }
      
    } catch (error) {
      console.error("Error loading employee schedule:", error);
      setWeekDays(scheduleService.generateWeekDays(formData.selectedWeekStart));
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (empId: string) => {
    const emp = employees.find(e => String(e.id) === empId);
    if (emp) {
      setFormData(prev => ({ 
        ...prev, 
        employeeId: String(emp.id), 
        employeeName: emp.name,
        selectedDays: [],
        startTime: "",
        endTime: ""
      }));
    }
  };

  const handleWeekNavigation = (direction: 'prev' | 'next') => {
    const newWeekStart = direction === 'prev' 
      ? scheduleService.getPreviousWeek(formData.selectedWeekStart)
      : scheduleService.getNextWeek(formData.selectedWeekStart);
    
    setFormData(prev => ({ 
      ...prev, 
      selectedWeekStart: newWeekStart,
      selectedDays: []
    }));
  };

  const handleDayToggle = (dayIndex: number) => {
    const isSelected = formData.selectedDays.includes(dayIndex);
    const newSelectedDays = isSelected
      ? formData.selectedDays.filter(d => d !== dayIndex)
      : [...formData.selectedDays, dayIndex];
    
    setFormData(prev => ({ ...prev, selectedDays: newSelectedDays }));
  };

  const handleAffectationTypeChange = (type: NewsFormDataV2['affectationType']) => {
    setFormData(prev => ({ 
      ...prev, 
      affectationType: type,
      // Si cambia a día completo, igualar fecha fin a fecha inicio
      fechaFinal: type === "full_day" ? prev.date : prev.fechaFinal,
      // Limpiar horarios si no es parcial
      startTime: type === 'partial_hours' ? prev.startTime : "",
      endTime: type === 'partial_hours' ? prev.endTime : ""
    }));
  };

  const getWeekRangeLabel = () => {
    const startDate = new Date(formData.selectedWeekStart);
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

      {/* Fechas de Novedad */}
      {formData.employeeId && (
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
              onChange={e => {
                const newDate = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  date: newDate,
                  // Si es día completo, sincronizar fecha fin automáticamente
                  fechaFinal: prev.affectationType === "full_day" ? newDate : prev.fechaFinal,
                }));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1a5c3a]" />
              Fecha Final
              {formData.affectationType === "full_day" && (
                <span className="text-xs text-gray-400 font-normal">(igual al inicio)</span>
              )}
            </Label>
            <input
              type="date"
              className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a] focus:border-transparent ${
                formData.affectationType === "full_day"
                  ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 bg-transparent"
              }`}
              value={formData.affectationType === "full_day" ? (formData.date || "") : (formData.fechaFinal || "")}
              min={formData.date || undefined}
              readOnly={formData.affectationType === "full_day"}
              onChange={e => {
                if (formData.affectationType !== "full_day") {
                  setFormData(prev => ({ ...prev, fechaFinal: e.target.value }));
                }
              }}
            />
          </div>
        </div>
      )}

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
              checked={formData.affectationType === 'full_day'}
              onChange={(e) => handleAffectationTypeChange(e.target.value as any)}
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
              checked={formData.affectationType === 'partial_hours'}
              onChange={(e) => handleAffectationTypeChange(e.target.value as any)}
              className="text-[#1a5c3a]"
            />
            <label htmlFor="partial_hours" className="text-sm">
              Horario específico (seleccionar horas)
            </label>
          </div>
        </div>
      </div>

      {/* Selección de Horarios (solo si es parcial) */}
      {formData.affectationType === 'partial_hours' && (
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

      {/* Validaciones */}
      {validation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validation.warnings.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validation.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Resumen de Selección */}
      {formData.date && validation.isValid && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Resumen de la novedad:</p>
              <p>
                <strong>Fechas:</strong> {formData.date} {formData.fechaFinal ? `al ${formData.fechaFinal}` : ''}
              </p>
              {formData.affectationType === 'partial_hours' && formData.startTime && formData.endTime && (
                <p>
                  <strong>Horario:</strong> {formData.startTime} - {formData.endTime}
                </p>
              )}
              <p>
                <strong>Tipo:</strong> {
                  formData.affectationType === 'full_day' ? 'Día completo' : 'Horario específico'
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
          disabled={!validation.isValid || !formData.description.trim()}
        >
          {editingNews ? "Actualizar" : "Crear"} Novedad
        </Button>
      </div>
    </div>
  );
}