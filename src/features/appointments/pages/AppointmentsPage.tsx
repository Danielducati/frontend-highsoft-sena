//frontend-highsoft-sena\src\features\appointments\pages\AppointmentsPage.tsx
import { Card, CardContent } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Badge } from "../../../shared/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import {
  Plus, ChevronLeft, ChevronRight, Search, Filter,
  List, Calendar, XCircle, Eye, Pencil, CalendarIcon,
  Trash2,
} from "lucide-react";
import { AppointmentsModuleProps } from "../types";
import { WEEK_DAYS, TIME_SLOTS, LEGEND_ITEMS } from "../constants";
import { getStatusColor, getStatusLabel } from "../utils";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentFormDialog } from "../components/AppointmentFormDialog";
import { AppointmentViewDialog } from "../components/AppointmentViewDialog";
import { DeleteAppointmentDialog, CancelAppointmentDialog } from "../components/ConfirmDialogs";
import { SpaPage } from "../../../shared/components/layout/SpaPage";
import { Appointment } from "../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

function buildColumns(apts: Appointment[]): Appointment[][] {
  const sorted = [...apts].sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
  const columns: Appointment[][] = [];
  for (const apt of sorted) {
    let placed = false;
    for (const col of columns) {
      const last = col[col.length - 1];
      if (toMin(last.endTime) <= toMin(apt.startTime)) {
        col.push(apt);
        placed = true;
        break;
      }
    }
    if (!placed) columns.push([apt]);
  }
  return columns;
}

/**
 * Siempre reserva un carril libre de ancho fijo (FREE_LANE_PX) a la derecha.
 * Las citas se distribuyen en el espacio restante (100% - FREE_LANE_PX).
 */
const FREE_LANE_PX = 48;

function getAptLayout(apt: Appointment, allApts: Appointment[]) {
  const columns  = buildColumns(allApts);
  const aptStart = toMin(apt.startTime);
  const aptEnd   = toMin(apt.endTime);

  const overlappingCols = columns.filter(col =>
    col.some(a => toMin(a.startTime) < aptEnd && toMin(a.endTime) > aptStart)
  );

  const colIndex  = overlappingCols.findIndex(col => col.includes(apt));
  const totalCols = overlappingCols.length;

  // Cada cita ocupa una fracción del espacio disponible (excluyendo el carril libre fijo)
  // Se expresa como calc() para combinar % y px
  const widthCalc = `calc((100% - ${FREE_LANE_PX}px) / ${totalCols})`;
  const leftCalc  = `calc((100% - ${FREE_LANE_PX}px) / ${totalCols} * ${colIndex})`;

  return { colIndex, totalCols, widthCalc, leftCalc };
}

// ─────────────────────────────────────────────────────────────────────────────

const ROW_HEIGHT = 80; // px por franja de 30 min — más grande para mejor UX

const STATUS_COLORS: Record<string, { bg: string; border: string }> = {
  pending:   { bg: "#FEF3C7", border: "#D97706" },  // amber-100 / amber-700
  cancelled: { bg: "#FEE2E2", border: "#B91C1C" },  // red-100 / red-700
  completed: { bg: "#DBEAFE", border: "#1D4ED8" },  // blue-100 / blue-700
};

export function AppointmentsPage({ userRole }: AppointmentsModuleProps) {
  const {
    services, employees, clients, loading, appointments,
    currentWeekStart, viewMode, setViewMode,
    searchTerm, setSearchTerm, filterStatus, setFilterStatus,
    isDialogOpen, setIsDialogOpen,
    editingAppointment, viewingAppointment, setViewingAppointment,
    deleteDialogOpen, setDeleteDialogOpen, setAppointmentToDelete,
    cancelDialogOpen, setCancelDialogOpen, setAppointmentToCancel,
    formData, setFormData, selectedServices, currentService, setCurrentService,
    filteredAppointments,
    getWeekDates, goToPreviousWeek, goToNextWeek, goToToday,
    isToday, isPastDate, getEmployeesByCategory,
    isCellFullyBlocked,
    handleAddService, handleRemoveService,
    handleCreateOrUpdate, handleDelete, handleCancelAppointment,
    handleUpdateStatus, resetForm, handleEdit, handleClientChange,
    myEmployeeProfile,
  } = useAppointments(userRole);

  const EMPTY_FORM = {
    clientId: "", clientName: "", clientPhone: "",
    date: new Date(), startTime: "", notes: "",
  };

  const firstSlotMin = toMin(TIME_SLOTS[0]);
  const totalHeight  = TIME_SLOTS.length * ROW_HEIGHT;

  const getAptsByDate = (date: Date) =>
    appointments.filter(a => a.date.toDateString() === date.toDateString());

  const aptTop = (apt: Appointment) =>
    ((toMin(apt.startTime) - firstSlotMin) / 30) * ROW_HEIGHT;

  const aptHeight = (apt: Appointment) =>
    Math.max(((toMin(apt.endTime) - toMin(apt.startTime)) / 30) * ROW_HEIGHT - 4, ROW_HEIGHT * 0.85);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500">Cargando citas...</div>
  );

  return (
    <SpaPage
      title="Gestión de Citas"
      subtitle={
        viewMode === "calendar"
          ? "Haz clic en cualquier hora disponible para crear una cita"
          : "Listado completo de todas las citas registradas"
      }
      icon={<CalendarIcon className="w-5 h-5 text-[#78D1BD]" />}
      action={
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-gray-200 bg-white p-1">
            {(["calendar", "list"] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-all ${
                  viewMode === mode ? "bg-primary text-white" : "text-gray-600 hover:text-gray-900"
                }`}>
                {mode === "calendar" ? <Calendar className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                {mode === "calendar" ? "Calendario" : "Lista"}
              </button>
            ))}
          </div>
          <button
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "10px 20px", borderRadius: 10,
              backgroundColor: "#1a3a2a", color: " #ffffff",
              fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
            onClick={() => { resetForm(); setIsDialogOpen(true); }}
          >
            <Plus className="w-4 h-4" />
            Nueva Cita
          </button>
        </div>
      }
    >
      <div className="space-y-4">

        {/* ── Vista Lista ── */}
        {viewMode === "list" && (
          <>
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input placeholder="Buscar por cliente..." value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-8 h-8 text-sm rounded-lg border-gray-200" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <Filter className="w-3.5 h-3.5 text-gray-400" />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32 h-8 text-sm rounded-lg border-gray-200">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pending">Pendientes</SelectItem>
                        <SelectItem value="completed">Completadas</SelectItem>
                        <SelectItem value="cancelled">Canceladas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="hidden lg:grid lg:grid-cols-[80px_1.5fr_1.5fr_1.2fr_100px_1.8fr_120px_140px] gap-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
              <div>Código</div><div>Cliente</div><div>Empleado</div>
              <div>Fecha</div><div>Hora</div><div>Servicios</div>
              <div>Estado</div><div className="text-right">Acciones</div>
            </div>

            <div className="space-y-1">
              {filteredAppointments.length === 0 ? (
                <Card className="border-gray-200">
                  <CardContent className="p-8 text-center">
                    <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No se encontraron citas</p>
                    <p className="text-sm text-gray-500 mt-1">Intenta ajustar los filtros</p>
                  </CardContent>
                </Card>
              ) : filteredAppointments.map(apt => (
                <div key={apt.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
                  <div className="grid grid-cols-1 lg:grid-cols-[80px_1.5fr_1.5fr_1.2fr_100px_1.8fr_120px_140px] gap-2 lg:gap-4 p-2.5 lg:p-4 items-start lg:items-center">
                    <span className="text-sm text-gray-900">#{String(apt.id).padStart(4, "0")}</span>
                    <div>
                      <p className="text-sm text-gray-900 truncate">{apt.clientName}</p>
                      <p className="text-xs text-gray-500 truncate">{apt.clientPhone}</p>
                    </div>
                    <p className="text-sm text-gray-700 truncate">{apt.services[0]?.employeeName ?? "N/A"}</p>
                    <p className="text-sm text-gray-700">
                      {apt.date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </p>
                    <p className="text-sm text-gray-700">{apt.startTime}</p>
                    <div>
                      {apt.services.slice(0, 2).map((s, i) => (
                        <p key={i} className="text-sm text-gray-700 truncate">{s.serviceName}</p>
                      ))}
                      {apt.services.length > 2 && (
                        <p className="text-xs text-gray-500">+{apt.services.length - 2} más</p>
                      )}
                    </div>
                    <Badge className={`${getStatusColor(apt.status)} text-[11px] px-2 py-0.5 whitespace-nowrap`}>
                      {getStatusLabel(apt.status)}
                    </Badge>
                    <div className="flex items-center justify-start lg:justify-end gap-1">
                      <button
                        onClick={() => setViewingAppointment(apt)}
                        title="Ver detalles"
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "#6b7c6b" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {userRole === "admin" && (
                        <>
                          <button
                            onClick={() => handleEdit(apt)}
                            title="Editar"
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: "#6b7c6b" }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setAppointmentToCancel(apt.id); setCancelDialogOpen(true); }}
                            disabled={apt.status === "cancelled"}
                            title="Cancelar"
                            className="p-2 rounded-lg transition-colors"
                            style={{
                              color: apt.status === "cancelled" ? "#d1d5db" : "#c0392b",
                              cursor: apt.status === "cancelled" ? "not-allowed" : "pointer",
                            }}
                            onMouseEnter={e => { if (apt.status !== "cancelled") e.currentTarget.style.backgroundColor = "#fdf0ee"; }}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Vista Calendario ── */}
        {viewMode === "calendar" && (
          <>
            {/* Navegación semana */}
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <button onClick={goToPreviousWeek} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="flex items-center gap-3">
                    <h3 className="text-gray-900">
                      {getWeekDates()[0].toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
                      {" - "}
                      {getWeekDates()[6].toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                    </h3>
                    <Button variant="outline" size="sm" onClick={goToToday}
                      className="border-gray-300 rounded-lg h-8 text-sm">Hoy</Button>
                  </div>
                  <button onClick={goToNextWeek} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Leyenda */}
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-xs text-gray-600">Estados:</span>
                  {LEGEND_ITEMS.map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded border-l-4"
                        style={{ borderLeftColor: color, backgroundColor: color + "20" }} />
                      <span className="text-xs text-gray-700">{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Grid del calendario */}
            <Card className="border-gray-200 shadow-sm overflow-hidden">
              {/* overflow-y: scroll para navegar con rueda del mouse */}
              <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "75vh" }}>
                <div className="min-w-[1600px]">

                  {/* Cabecera de días — sticky para que quede fija al hacer scroll */}
                  <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 z-40" style={{ background: "#f8f9fa" }}>
                    <div className="p-3 border-r border-gray-200 text-gray-500 text-xs uppercase tracking-wide">Hora</div>
                    {getWeekDates().map((date, idx) => (
                      <div key={idx} className="p-3 border-r border-gray-200 last:border-r-0 text-center"
                        style={{
                          backgroundColor: isToday(date)
                            ? "#F1F5F9"
                            : isPastDate(date)
                            ? "#ebebeb"
                            : "transparent"
                        }}
                      >
                        <div className={`text-xs uppercase tracking-wide ${isPastDate(date) ? "text-gray-400" : "text-gray-500"}`}>
                          {WEEK_DAYS[idx]}
                        </div>
                        <div className={`mt-1 text-lg font-semibold ${
                          isToday(date) ? "text-[#78D1BD]" : isPastDate(date) ? "text-gray-400" : "text-gray-800"
                        }`}>
                          {date.getDate()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cuerpo */}
                  <div className="grid grid-cols-8">

                    {/* Columna de horas — sticky para que quede fija al hacer scroll horizontal */}
                    <div className="border-r border-gray-200 bg-white sticky left-0 z-30">
                      {TIME_SLOTS.map(time => (
                        <div key={time}
                          style={{ height: ROW_HEIGHT }}
                          className="border-b border-gray-100 last:border-b-0 px-2 flex items-start pt-2">
                          <span className="text-[11px] text-gray-400 font-medium">{time}</span>
                        </div>
                      ))}
                    </div>

                    {/* Columna de cada día */}
                    {getWeekDates().map((date, dIdx) => {
                      const dayApts = getAptsByDate(date);
                      const past    = isPastDate(date);

                      // Para cada franja, indica si hay citas solapadas
                      const slotHasApts = (time: string): boolean => {
                        const slotMin = toMin(time);
                        const slotEnd = slotMin + 30;
                        return dayApts.some(a =>
                          toMin(a.startTime) < slotEnd && toMin(a.endTime) > slotMin
                        );
                      };

                      return (
                        <div key={dIdx}
                          className={`border-r border-gray-200 last:border-r-0 relative overflow-hidden`}
                          style={{ 
                            height: totalHeight,
                            backgroundColor: isToday(date) ? "#F1F5F9" : past ? "#f2f2f2" : "#ffffff"
                          }}
                        >
                          {/* Líneas guía */}
                          {TIME_SLOTS.map((_, i) => (
                            <div key={i}
                              className="absolute w-full border-b border-gray-100 pointer-events-none"
                              style={{ top: i * ROW_HEIGHT }} />
                          ))}

                          {/* Zonas clickeables por franja */}
                          {TIME_SLOTS.map(time => {
                            const hasApts = slotHasApts(time);
                            const top     = ((toMin(time) - firstSlotMin) / 30) * ROW_HEIGHT;

                            return (
                              <div key={time}>
                                <div
                                  className={`absolute transition-colors group ${
                                    !past
                                      ? "hover:bg-[#1a3a2a]/5 cursor-pointer"
                                      : "cursor-not-allowed"
                                  }`}
                                  style={{
                                    top,
                                    right:  0,
                                    width:  hasApts ? FREE_LANE_PX : "100%",
                                    height: ROW_HEIGHT,
                                    zIndex: 5,
                                  }}
                                  onClick={() => {
                                    if (!past) {
                                      setFormData({ ...EMPTY_FORM, date, startTime: time });
                                      setIsDialogOpen(true);
                                    }
                                  }}
                                >
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                    <div className="flex flex-col items-center gap-0.5">
                                      <Plus className="w-4 h-4 text-[#1a3a2a]/40" />
                                      {hasApts && (
                                        <span className="text-[9px] text-[#1a3a2a]/40 font-medium leading-none">
                                          {time}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Citas renderizadas con posición absoluta */}
                          {dayApts.map(apt => {
                            const { widthCalc, leftCalc } = getAptLayout(apt, dayApts);
                            const { bg, border } = STATUS_COLORS[apt.status] ?? STATUS_COLORS.pending;
                            const h = aptHeight(apt);

                            return (
                              <div
                                key={apt.id}
                                className="absolute rounded-md border-l-[3px] px-2 py-1.5 cursor-pointer hover:shadow-md hover:brightness-95 transition-all overflow-hidden"
                                style={{
                                  top:             aptTop(apt) + 2,
                                  height:          h,
                                  left:            `calc(${leftCalc} + 2px)`,
                                  width:           `calc(${widthCalc} - 4px)`,
                                  backgroundColor: bg,
                                  borderLeftColor: border,
                                  zIndex:          10,
                                }}
                                onClick={e => { e.stopPropagation(); setViewingAppointment(apt); }}
                              >
                                <p className="text-[11px] font-semibold truncate leading-tight" style={{ color: STATUS_COLORS[apt.status]?.border ?? "#D97706" }}>
                                  {apt.clientName}
                                </p>
                                <p className="text-[10px] leading-tight" style={{ color: STATUS_COLORS[apt.status]?.border ?? "#D97706", opacity: 0.8 }}>
                                  {apt.startTime} – {apt.endTime}
                                </p>
                                {h > 50 && (
                                  <p className="text-[10px] truncate leading-tight mt-0.5" style={{ color: STATUS_COLORS[apt.status]?.border ?? "#D97706", opacity: 0.8 }}>
                                    {apt.services.map(s => s.serviceName).join(", ")}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* ── Dialogs ── */}
        <AppointmentViewDialog
          appointment={viewingAppointment}
          employees={employees}
          userRole={userRole}
          onClose={() => setViewingAppointment(null)}
          onEdit={handleEdit}
          onDeleteRequest={id => { setAppointmentToDelete(id); setDeleteDialogOpen(true); }}
          onUpdateStatus={handleUpdateStatus}
        />
        <AppointmentFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingAppointment={editingAppointment}
          formData={formData}
          setFormData={setFormData}
          selectedServices={selectedServices}
          currentService={currentService}
          setCurrentService={setCurrentService}
          services={services}
          employees={employees}
          clients={clients}
          getEmployeesByCategory={getEmployeesByCategory}
          onAddService={handleAddService}
          onRemoveService={handleRemoveService}
          onClientChange={handleClientChange}
          onSubmit={handleCreateOrUpdate}
          onCancel={resetForm}
          userRole={userRole}
          myEmployeeProfile={myEmployeeProfile}
        />
        <DeleteAppointmentDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
        />
        <CancelAppointmentDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          onConfirm={handleCancelAppointment}
        />
      </div>
    </SpaPage>
  );
}