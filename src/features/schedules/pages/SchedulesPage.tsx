//frontend-highsoft-sena\src\features\schedules\pages\SchedulesPage.tsx
import { useState } from "react";
import { Card, CardContent } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Badge } from "../../../shared/ui/badge";
import { Plus, Search, X, Calendar, User, Clock, Eye, Pencil, Trash2, RefreshCw, History } from "lucide-react";
import { SchedulesModuleProps } from "../types";
import { useSchedules } from "../hooks/useSchedules";
import { ScheduleFormDialog } from "../components/ScheduleFormDialog";
import { ScheduleDetailDialog } from "../components/ScheduleDetailDialog";
import { ScheduleDeleteDialog } from "../components/ScheduleDeleteDialog";
import { ScheduleHistoryDialog } from "../components/ScheduleHistoryDialog";
import { formatWeekRange, getWeekDays, getDayBadgeColor, getDayLabel } from "../utils";
import { SpaPage } from "../../../shared/components/layout/SpaPage";

export function SchedulesPage({ userRole }: SchedulesModuleProps) {
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyEmployee, setHistoryEmployee] = useState<{ id: string; name: string; weekStart?: string } | null>(null);

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
    selectedMonth, weeksOfMonth,
    goToPreviousMonth, goToNextMonth,
    goToPreviousWeek, goToNextWeek,
    toggleDay, updateDaySchedule,
    handleCreateOrUpdate, handleDelete, handleRenewWeek,
    confirmDelete, handleEdit, handleViewDetail,
    resetForm, clearFilters,
  } = useSchedules();

  // Función para abrir el historial de un empleado
  const handleViewHistory = (schedule: any) => {
    setHistoryEmployee({
      id: schedule.employeeId,
      name: schedule.employeeName,
      weekStart: schedule.weekStartDate
    });
    setHistoryDialogOpen(true);
  };

  return (
    <SpaPage
      title="Horarios Mensuales"
      subtitle="Gestión de turnos y disponibilidad del personal"
      icon={<Calendar className="w-5 h-5 text-[#1a5c3a]" />}
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
                <Badge variant="secondary" className="text-xs bg-[#1a5c3a]/10 text-[#1a5c3a] border-[#1a5c3a]/30">
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

      {/* Tabla agrupada por mes */}
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
          ) : (() => {
            // Agrupar por mes (YYYY-MM) y por empleado
            const grouped: Record<string, typeof filteredSchedules> = {};
            for (const s of filteredSchedules) {
              const monthKey = s.weekStartDate.slice(0, 7); // "YYYY-MM"
              if (!grouped[monthKey]) grouped[monthKey] = [];
              grouped[monthKey].push(s);
            }
            const monthKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

            return (
              <div>
                {monthKeys.map(monthKey => {
                  const [y, m] = monthKey.split("-").map(Number);
                  const monthLabel = new Date(y, m - 1, 1).toLocaleDateString("es-ES", {
                    month: "long", year: "numeric"
                  });
                  const monthSchedules = grouped[monthKey];

                  // Agrupar semanas del mes por empleado para numerar "Semana 1, 2..."
                  const byEmployee: Record<string, typeof filteredSchedules> = {};
                  for (const s of monthSchedules) {
                    if (!byEmployee[s.employeeId]) byEmployee[s.employeeId] = [];
                    byEmployee[s.employeeId].push(s);
                  }
                  // Ordenar semanas de cada empleado de más antigua a más reciente para numerarlas
                  for (const empId of Object.keys(byEmployee)) {
                    byEmployee[empId].sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate));
                  }

                  return (
                    <div key={monthKey}>
                      {/* Cabecera de mes */}
                      <div className="px-4 py-2 bg-[#edf7f4] border-b border-[#78D1BD]/30 sticky top-0">
                        <span className="text-sm font-semibold text-[#1a3a2a] capitalize">
                          {monthLabel}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({monthSchedules.length} semana{monthSchedules.length !== 1 ? "s" : ""})
                        </span>
                      </div>

                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/30">
                            <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Empleado</th>
                            <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Período</th>
                            <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Horarios por día</th>
                            {userRole === "admin" && (
                              <th className="text-center px-4 py-2 text-xs text-gray-500 font-medium w-36">Acciones</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {monthSchedules
                            .sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate))
                            .map((schedule) => {
                              const weekDays = getWeekDays(new Date(schedule.weekStartDate + "T12:00:00"));
                              // Número de semana dentro del mes para este empleado
                              const weekNum = (byEmployee[schedule.employeeId] ?? [])
                                .findIndex(s => s.weekStartDate === schedule.weekStartDate) + 1;

                              return (
                                <tr key={schedule.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4 text-[#1a5c3a] flex-shrink-0" />
                                      <div>
                                        <p className="text-sm text-gray-900">{schedule.employeeName}</p>
                                        <p className="text-xs text-gray-500">
                                          {employees.find(e => e.id === schedule.employeeId)?.specialty}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-4 py-3">
                                    <p className="text-sm font-medium text-[#1a3a2a]">
                                      Semana {weekNum}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {formatWeekRange(schedule.weekStartDate)}
                                    </p>
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
                                        <button onClick={() => handleViewHistory(schedule)} title="Ver historial"
                                          className="p-2 rounded-lg transition-colors" style={{ color: "#1a5c3a" }}
                                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#edf7f4")}
                                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                                          <History className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleRenewWeek(schedule)} title="Renovar a siguiente semana"
                                          className="p-2 rounded-lg transition-colors" style={{ color: "#1a5c3a" }}
                                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#edf7f4")}
                                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                                          <RefreshCw className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleViewDetail(schedule)} title="Ver detalles"
                                          className="p-2 rounded-lg transition-colors" style={{ color: "#6b7c6b" }}
                                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
                                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                                          <Eye className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleEdit(schedule)} title="Editar"
                                          className="p-2 rounded-lg transition-colors" style={{ color: "#6b7c6b" }}
                                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
                                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                                          <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => confirmDelete(schedule)} title="Eliminar"
                                          className="p-2 rounded-lg transition-colors" style={{ color: "#c0392b" }}
                                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fdf0ee")}
                                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </CardContent>
      </Card>
      {/* Dialogs */}
      <ScheduleFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingSchedule={editingSchedule}
        formData={formData}
        setFormData={setFormData}
        selectedMonth={selectedMonth}
        weeksOfMonth={weeksOfMonth}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
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
      <ScheduleHistoryDialog
        isOpen={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        employeeId={historyEmployee?.id || ""}
        employeeName={historyEmployee?.name || ""}
        weekStartDate={historyEmployee?.weekStart}
      />
      </div>
    </SpaPage>
  );
}
