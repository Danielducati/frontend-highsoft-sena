//frontend-highsoft-sena\src\features\schedules\pages\SchedulesPage.tsx
import { useState } from "react";
import { Input } from "../../../shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Plus, Search, Calendar, User, Clock, ChevronDown, ChevronUp, Eye, Pencil, Trash2, History, Users, RefreshCw } from "lucide-react";
import { SchedulesModuleProps } from "../types";
import { useSchedules } from "../hooks/useSchedules";
import { ScheduleFormDialog } from "../components/ScheduleFormDialog";
import { ScheduleDetailDialog } from "../components/ScheduleDetailDialog";
import { ScheduleDeleteDialog } from "../components/ScheduleDeleteDialog";
import { ScheduleHistoryDialog } from "../components/ScheduleHistoryDialog";
import { formatWeekRange, getDayLabel } from "../utils";
import { SpaPage } from "../../../shared/components/layout/SpaPage";

export function SchedulesPage({ userRole }: SchedulesModuleProps) {
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyEmployee, setHistoryEmployee] = useState<{ id: string; name: string; weekStart?: string } | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

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
    handleCreateOrUpdate, handleDelete, handleDeleteWeek, handleRenewMonth,
    confirmDelete, handleEdit, handleViewDetail,
    resetForm,
  } = useSchedules();

  const handleViewHistory = (schedule: any) => {
    setHistoryEmployee({ id: schedule.employeeId, name: schedule.employeeName, weekStart: schedule.weekStartDate });
    setHistoryDialogOpen(true);
  };

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      next.has(cardId) ? next.delete(cardId) : next.add(cardId);
      return next;
    });
  };

  // ── Agrupar por empleado+mes ──────────────────────────────────────────────
  const rowMap: Record<string, {
    employeeId: string; employeeName: string; specialty: string;
    monthKey: string; monthLabel: string;
    weeks: typeof filteredSchedules;
  }> = {};

  for (const s of filteredSchedules) {
    const monthKey = s.weekStartDate.slice(0, 7);
    const rowKey   = `${s.employeeId}_${monthKey}`;
    if (!rowMap[rowKey]) {
      const [y, m] = monthKey.split("-").map(Number);
      rowMap[rowKey] = {
        employeeId:   s.employeeId,
        employeeName: s.employeeName,
        specialty:    employees.find(e => e.id === s.employeeId)?.specialty ?? "",
        monthKey,
        monthLabel: new Date(y, m - 1, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" }),
        weeks: [],
      };
    }
    rowMap[rowKey].weeks.push(s);
  }

  const rows = Object.values(rowMap).sort((a, b) =>
    b.monthKey.localeCompare(a.monthKey) || a.employeeName.localeCompare(b.employeeName)
  );

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalEmpleados = new Set(filteredSchedules.map(s => s.employeeId)).size;
  const totalMeses     = new Set(filteredSchedules.map(s => s.weekStartDate.slice(0, 7))).size;
  const totalSemanas   = filteredSchedules.length;
  const totalDias      = filteredSchedules.reduce((sum, s) => sum + s.daySchedules.length, 0);

  return (
    <SpaPage
      title="Horarios Mensuales"
      subtitle="Gestión de turnos y disponibilidad del personal"
      icon={<Calendar className="w-5 h-5 text-[#1a5c3a]" />}
      action={
        userRole === "admin" ? (
          <button
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "10px 20px", borderRadius: 10,
              backgroundColor: "#1a3a2a", color: "#ffffff",
              fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
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
      <div className="space-y-5">

        {/* ── Filtros ───────────────────────────────────────────────────── */}
        <div style={{
          backgroundColor: "#ffffff", borderRadius: 14,
          border: "1px solid #E5E7EB", padding: 16,
          display: "flex", gap: 12,
        }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#9ca3af" }} />
            <Input
              placeholder="Buscar por empleado..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 h-9 rounded-lg border-gray-200"
            />
          </div>
          <div style={{ width: 220 }}>
            <Select value={filterEmployee} onValueChange={setFilterEmployee}>
              <SelectTrigger className="h-9 rounded-lg border-gray-200">
                <SelectValue placeholder="Todos los empleados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los empleados</SelectItem>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Cards ─────────────────────────────────────────────────────── */}
        {rows.length === 0 ? (
          <div style={{
            backgroundColor: "#ffffff", borderRadius: 14, border: "1px solid #E5E7EB",
            padding: "48px 24px", textAlign: "center",
          }}>
            <Calendar style={{ width: 40, height: 40, color: "#d1d5db", margin: "0 auto 12px" }} />
            <p style={{ color: "#6b7c6b", fontSize: 14 }}>No hay horarios registrados</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rows.map(row => {
              const cardId    = `${row.employeeId}_${row.monthKey}`;
              const expanded    = expandedCards.has(cardId);
              const sortedWeeks = row.weeks.sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate));
              const firstWeek   = sortedWeeks[0];

              // Mostrar los días de la semana actual si existe en este mes,
              // si no, la primera semana del mes
              const todayISO = new Date().toISOString().split("T")[0];
              const currentWeek = sortedWeeks.find(w => {
                // La semana va de lunes (weekStartDate) a domingo (+6 días)
                const [y, m, d] = w.weekStartDate.split("-").map(Number);
                const start = new Date(Date.UTC(y, m - 1, d));
                const end   = new Date(Date.UTC(y, m - 1, d + 6));
                return todayISO >= start.toISOString().split("T")[0] &&
                       todayISO <= end.toISOString().split("T")[0];
              }) ?? firstWeek;

              const dayPattern = (currentWeek ?? firstWeek)?.daySchedules.sort((a, b) => a.dayIndex - b.dayIndex) ?? [];
              const isCurrentMonth = currentWeek != null;

              return (
                <div key={cardId} style={{
                  backgroundColor: "#ffffff", borderRadius: 16,
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                }}>
                  {/* ── Cabecera de la card ── */}
                  <div style={{
                    padding: "14px 20px",
                    display: "flex", alignItems: "center", gap: 16,
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      backgroundColor: "#edf7f4", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#1a3a2a" }}>
                        {row.employeeName.split(" ").map(p => p[0]).slice(0, 2).join("")}
                      </span>
                    </div>

                    {/* Info + días en la misma columna */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Fila 1: nombre, mes, semanas */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#1a3a2a", margin: 0 }}>
                          {row.employeeName}
                        </p>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "2px 8px",
                          borderRadius: 999, backgroundColor: "#edf7f4", color: "#1a5c3a",
                          textTransform: "capitalize",
                        }}>
                          {row.monthLabel}
                        </span>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>
                          {sortedWeeks.length} semana{sortedWeeks.length !== 1 ? "s" : ""} · {dayPattern.length} días activos
                        </span>
                      </div>

                      {/* Fila 2: mini-cards de días — semana actual o primera del mes */}
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
                        {isCurrentMonth && (
                          <span style={{
                            fontSize: 10, fontWeight: 600, color: "#1a5c3a",
                            backgroundColor: "#edf7f4", padding: "1px 7px", borderRadius: 999,
                            border: "1px solid #78D1BD", flexShrink: 0,
                          }}>
                            Esta semana
                          </span>
                        )}
                        {dayPattern.map(ds => (
                          <div key={ds.dayIndex} style={{
                            backgroundColor: "#f8fafb", border: "1px solid #E5E7EB",
                            borderRadius: 7, padding: "3px 9px", textAlign: "center",
                          }}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: "#1a3a2a", margin: 0 }}>
                              {getDayLabel(ds.dayIndex).short}
                            </p>
                            <p style={{ fontSize: 10, color: "#6b7c6b", margin: 0 }}>
                              {ds.startTime}–{ds.endTime}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Acciones CRUD + expand */}
                    <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                      {userRole === "admin" && (
                        <>
                          <button onClick={() => handleRenewMonth(row.employeeId, row.monthKey, sortedWeeks)}
                            title={`Copiar horario al mes siguiente`}
                            style={{ width: 32, height: 32, borderRadius: 6, border: "none", backgroundColor: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a5c3a" }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#edf7f4")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                            <RefreshCw style={{ width: 15, height: 15 }} />
                          </button>
                          <button onClick={() => handleViewDetail(firstWeek)} title="Ver detalles"
                            style={{ width: 32, height: 32, borderRadius: 6, border: "none", backgroundColor: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a3a2a" }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#edf7f4")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                            <Eye style={{ width: 15, height: 15 }} />
                          </button>
                          <button onClick={() => handleEdit(firstWeek)} title="Editar"
                            style={{ width: 32, height: 32, borderRadius: 6, border: "none", backgroundColor: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a3a2a" }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#edf7f4")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                            <Pencil style={{ width: 15, height: 15 }} />
                          </button>
                          <button onClick={() => confirmDelete(row.employeeId, row.monthKey, sortedWeeks)} title="Eliminar mes"
                            style={{ width: 32, height: 32, borderRadius: 6, border: "none", backgroundColor: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fdf0ee")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                            <Trash2 style={{ width: 15, height: 15 }} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => toggleCard(cardId)}
                        style={{
                          width: 32, height: 32, borderRadius: 6, border: "1px solid #E5E7EB",
                          backgroundColor: "transparent", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7c6b",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        {expanded
                          ? <ChevronUp style={{ width: 15, height: 15 }} />
                          : <ChevronDown style={{ width: 15, height: 15 }} />}
                      </button>
                    </div>
                  </div>

                  {/* ── Detalle expandido — solo semanas ── */}
                  {expanded && (
                    <div style={{ borderTop: "1px solid #F3F4F6", padding: "12px 20px", backgroundColor: "#fafafa" }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7c6b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Semanas del mes
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {sortedWeeks.map((w, i) => (
                          <div key={w.id} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "7px 12px", borderRadius: 8,
                            backgroundColor: "#ffffff", border: "1px solid #E5E7EB",
                          }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700, color: "#1a5c3a",
                              backgroundColor: "#edf7f4", padding: "2px 8px", borderRadius: 999, flexShrink: 0,
                            }}>
                              Sem. {i + 1}
                            </span>
                            <span style={{ fontSize: 12, color: "#6b7c6b" }}>
                              {formatWeekRange(w.weekStartDate)}
                            </span>
                            <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>
                              {w.daySchedules.length} días
                            </span>
                            {userRole === "admin" && (
                              <button
                                onClick={() => handleDeleteWeek(w)}
                                title="Eliminar esta semana"
                                style={{
                                  width: 26, height: 26, borderRadius: 5, border: "none",
                                  backgroundColor: "transparent", cursor: "pointer",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: "#ef4444", flexShrink: 0,
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fdf0ee")}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                              >
                                <Trash2 style={{ width: 13, height: 13 }} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
                        Para ver el horario detallado de cada semana, usa el botón 👁 Ver detalles.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Dialogs ───────────────────────────────────────────────────── */}
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
          allWeeks={editingSchedule
            ? rows.find(r => r.employeeId === editingSchedule.employeeId && r.monthKey === editingSchedule.weekStartDate.slice(0, 7))?.weeks
            : undefined}
          onSelectWeekToEdit={handleEdit}
        />
        <ScheduleDetailDialog
          isOpen={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          schedule={viewingSchedule}
          employees={employees}
          allWeeks={viewingSchedule
            ? rows.find(r => r.employeeId === viewingSchedule.employeeId && r.monthKey === viewingSchedule.weekStartDate.slice(0, 7))?.weeks
            : undefined}
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
