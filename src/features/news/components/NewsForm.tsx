//components/NewsForm.tsx
import { Label } from "../../../shared/ui/label";
import { Input } from "../../../shared/ui/input";
import { Textarea } from "../../../shared/ui/textarea";
import { Button } from "../../../shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { NEWS_TYPES, TIME_SLOTS } from "../constants";
import { Employee, EmployeeNews, NewsFormData } from "../types";
import { User, Calendar, Clock, FileText, Tag } from "lucide-react";

interface NewsFormProps {
  formData:    NewsFormData;
  setFormData: React.Dispatch<React.SetStateAction<NewsFormData>>;
  employees:   Employee[];
  editingNews: EmployeeNews | null;
  onSubmit:    () => void;
  onCancel:    () => void;
}

export function NewsForm({ formData, setFormData, employees, editingNews, onSubmit, onCancel }: NewsFormProps) {
  const handleEmployeeChange = (empId: string) => {
    const emp = employees.find(e => String(e.id) === empId);
    if (emp) setFormData(prev => ({ ...prev, employeeId: String(emp.id), employeeName: emp.name }));
  };

  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <User className="w-4 h-4 text-[#78D1BD]" />
          Empleado *
        </Label>
        <Select
          value={formData.employeeId || "placeholder"}
          onValueChange={v => { if (v !== "placeholder") handleEmployeeChange(v); }}
        >
          <SelectTrigger className="border-gray-300"><SelectValue placeholder="Selecciona un empleado" /></SelectTrigger>
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

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#78D1BD]" />
          Tipo de Novedad *
        </Label>
        <Select
          value={formData.type}
          onValueChange={(v: any) => setFormData(prev => ({ ...prev, type: v }))}
        >
          <SelectTrigger className="border-gray-300"><SelectValue /></SelectTrigger>
          <SelectContent>
            {NEWS_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#78D1BD]" />
            Fecha Inicio *
          </Label>
          <Input
            className="border-gray-300"
            type="date"
            min={hoy}
            value={formData.date}
            onChange={e => {
              const nuevaFecha = e.target.value;
              setFormData(prev => ({
                ...prev,
                date: nuevaFecha,
                // Si la fecha final era anterior a la nueva fecha inicio, la resetea
                fechaFinal: prev.fechaFinal && prev.fechaFinal < nuevaFecha ? "" : prev.fechaFinal,
              }));
            }}
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#78D1BD]" />
            Fecha Final
          </Label>
          <Input
            className="border-gray-300"
            type="date"
            min={formData.date || hoy}
            value={formData.fechaFinal}
            onChange={e => setFormData(prev => ({ ...prev, fechaFinal: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#78D1BD]" />
            Hora Inicio
          </Label>
          <Select
            value={formData.startTime || "placeholder"}
            onValueChange={v => { if (v !== "placeholder") setFormData(prev => ({ ...prev, startTime: v })); }}
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Selecciona hora" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="placeholder" disabled>Selecciona hora</SelectItem>
              {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#78D1BD]" />
            Hora Final
          </Label>
          <Select
            value={formData.endTime || "placeholder"}
            onValueChange={v => { if (v !== "placeholder") setFormData(prev => ({ ...prev, endTime: v })); }}
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Selecciona hora" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="placeholder" disabled>Selecciona hora</SelectItem>
              {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#78D1BD]" />
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

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button variant="default" onClick={onSubmit}>
          {editingNews ? "Actualizar" : "Crear"} Novedad
        </Button>
      </div>
    </div>
  );
}