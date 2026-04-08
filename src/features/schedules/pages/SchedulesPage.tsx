//frontend-highsoft-sena\src\features\schedules\pages\SchedulesPage.tsx
import { Card, CardContent } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Badge } from "../../../shared/ui/badge";
import { Plus, Search, X, Calendar, User, Clock, Eye, Pencil, Trash2 } from "lucide-react";
import { SchedulesModuleProps } from "../types";
import { useSchedules } from "../hooks/useSchedules";
import { ScheduleFormDialog } from "../components/ScheduleFormDialog";
import { ScheduleDetailDialog } from "../components/ScheduleDetailDialog";
import { ScheduleDeleteDialog } from "../components/ScheduleDeleteDialog";
import { formatWeekRange, getWeekDays, getDayBadgeColor, getDayLabel } from "../utils";
import { SpaPage } from "../../../shared/components/layout/SpaPage";

export function SchedulesPage({ userRole }: SchedulesModuleProps) {
  const {
    filteredSchedules, employees,
    isDialogOpen, setIsDialogOpen,
    editingSchedule,
    deleteDialogOpen, setDeleteDialogOpen,
    detailDialogOpen, setDetailDialogOpen,
    viewingSchedule,
    searchTerm, setSearchTerm,
    filterEmployee, setFilterEmployee,
    formWeekStart, formData, setFormData,
    formWeekDays,
    goToPreviousWeek, goToNextWeek,
    toggleDay, updateDaySchedule,
    handleCreateOrUpdate, handleDelete,
    confirmDelete, handleEdit, handleViewDetail,
    resetForm, clearFilters,
  } = useSchedules();

  return (
    <SpaPage
      title="Horarios Semanales"
      subtitle="Gestión de turnos y disponibilidad del personal"
      icon={<Calendar className="w-5 h-5 text-[#78D1BD]" />}
      action={
        userRole === "admin" ? (
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 10,
              backgroundColor: "#1a3a2a",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
            onClick={() => { resetForm(); setIsDialogOpen(true); }}
          >
            <Plus className="w-4 h-4" />
            Nuevo Horario
          </button>
        ) : undefined
      }
    >
      <div className="space-y-4">

      {/* Filtros */}
      <Card className="border-gray-200 shadow-sm rounded-2xl">
        <CardContent className="p-4">
        <div className="flex gap-3 w-full">
          {/* BUSCADOR */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por empleado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 rounded-lg border-gray-200 w-full"
            />
          </div>

          {/* FILTRO EMPLEADO (DERECHA) */}
          <div className="w-64">
            <Select value={filterEmployee} onValueChange={setFilterEmployee}>
              <SelectTrigger className="h-9 rounded-lg border-gray-200 w-full">
                <SelectValue placeholder="Todos los empleados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los empleados</SelectItem>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

          {/* Filtros activos */}
          {(searchTerm || filterEmployee !== "all") && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
              <span className="text-xs text-gray-600">Filtros activos:</span>
              {searchTerm && (
                <Badge variant="secondary" className="text-xs bg-[#78D1BD]/10 text-[#78D1BD] border-[#78D1BD]/30">
                  Búsqueda: {searchTerm}
                </Badge>
              )}
              {filterEmployee !== "all" && (
                <Badge variant="secondary" className="text-xs bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/30">
                  Empleado: {employees.find(e => e.id === filterEmployee)?.name}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {filteredSchedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Calendar className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-center">
                {searchTerm || filterEmployee !== "all"
                  ? "No se encontraron horarios con los filtros aplicados"
                  : "No hay horarios registrados"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-sm text-gray-700">Empleado</th>
                    <th className="text-left px-4 py-3 text-sm text-gray-700">Semana</th>
                    <th className="text-left px-4 py-3 text-sm text-gray-700">Horarios por Día</th>
                    {userRole === "admin" && (
                      <th className="text-center px-4 py-3 text-sm text-gray-700 w-32">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSchedules.map((schedule) => {
                    // ← FIX 1: convertir string a Date para getWeekDays
                    const weekDays = getWeekDays(new Date(schedule.weekStartDate + "T00:00:00"));
                    return (
                      <tr key={schedule.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#78D1BD] flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-900">{schedule.employeeName}</p>
                              <p className="text-xs text-gray-500">
                                {employees.find(e => e.id === schedule.employeeId)?.specialty}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{formatWeekRange(schedule.weekStartDate)}</p>
                        </td>

                        <td className="px-4 py-3">
                          <div className="space-y-1.5">
                            {schedule.daySchedules
                              .sort((a, b) => a.dayIndex - b.dayIndex)
                              .map(ds => {
                                const day  = getDayLabel(ds.dayIndex);
                                const date = weekDays[ds.dayIndex];
                                return (
                                  <div key={ds.dayIndex} className="flex items-center gap-2 text-sm">
                                    <Badge variant="secondary" className={`text-xs ${getDayBadgeColor(ds.dayIndex)}`}>
                                      {day.short}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {date.getDate()}/{date.getMonth() + 1}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-[#60A5FA]" />
                                      <span className="text-gray-900">{ds.startTime}</span>
                                      <span className="text-gray-400">→</span>
                                      <span className="text-gray-900">{ds.endTime}</span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </td>

                        {userRole === "admin" && (
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleViewDetail(schedule)} className="h-8 w-8 hover:bg-[#78D1BD]/10 hover:text-[#78D1BD]">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(schedule)} className="h-8 w-8 hover:bg-[#60A5FA]/10 hover:text-[#60A5FA]">
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              {/* ← FIX 2: pasar schedule completo en lugar de schedule.id */}
                              <Button variant="ghost" size="icon" onClick={() => confirmDelete(schedule)} className="h-8 w-8 hover:bg-[#F87171]/10 hover:text-[#F87171]">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ScheduleFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingSchedule={editingSchedule}
        formData={formData}
        setFormData={setFormData}
        formWeekStart={formWeekStart}
        formWeekDays={formWeekDays}
        employees={employees}
        onSubmit={handleCreateOrUpdate}
        onCancel={resetForm}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        onToggleDay={toggleDay}
        onUpdateDaySchedule={updateDaySchedule}
      />
      <ScheduleDetailDialog
        isOpen={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        schedule={viewingSchedule}
        employees={employees}
      />
      <ScheduleDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
      </div>
    </SpaPage>
  );
}
