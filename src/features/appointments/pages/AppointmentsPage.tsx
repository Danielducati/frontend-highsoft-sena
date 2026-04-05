import { Card, CardContent } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Badge } from "../../../shared/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import {
  Plus, ChevronLeft, ChevronRight, Clock, Search, Filter,
  List, Calendar, XCircle, Edit, CalendarIcon,
} from "lucide-react";
import { AppointmentsModuleProps } from "../types";
import { WEEK_DAYS, TIME_SLOTS, LEGEND_ITEMS } from "../constants";
import { getStatusColor, getStatusLabel } from "../utils";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentFormDialog } from "../components/AppointmentFormDialog";
import { AppointmentViewDialog } from "../components/AppointmentViewDialog";
import { DeleteAppointmentDialog, CancelAppointmentDialog } from "../components/ConfirmDialogs";
import { SpaPage } from "../../../shared/components/layout/SpaPage";

export function AppointmentsPage({ userRole }: AppointmentsModuleProps) {
  const {
    services, employees, clients, loading,
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
    getAppointmentsForCell, getAppointmentCellSpan,
    handleAddService, handleRemoveService,
    handleCreateOrUpdate, handleDelete, handleCancelAppointment,
    handleUpdateStatus, resetForm, handleEdit, handleClientChange,
  } = useAppointments();

  const EMPTY_FORM = { clientId: "", clientName: "", clientPhone: "", date: new Date(), startTime: "", notes: "" };

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
        <div className="flex gap-2" style={{ fontFamily: "var(--font-body)" }}>
          <div className="flex rounded-lg border border-gray-200 bg-white p-1">
            {(["calendar", "list"] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`inline-flex items-center justify-center gap-1.5 rounded px-2.5 py-1 text-xs transition-all ${
                  viewMode === mode
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}>
                {mode === "calendar" ? <Calendar className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                {mode === "calendar" ? "Calendario" : "Lista"}
              </button>
            ))}
          </div>
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
                  <span className="text-sm text-gray-900">#{String(apt.id).padStart(4,"0")}</span>
                  <div>
                    <p className="text-sm text-gray-900 truncate">{apt.clientName}</p>
                    <p className="text-xs text-gray-500 truncate">{apt.clientPhone}</p>
                  </div>
                  <p className="text-sm text-gray-700 truncate">{apt.services[0]?.employeeName ?? "N/A"}</p>
                  <p className="text-sm text-gray-700">
                    {apt.date.toLocaleDateString("es-ES", { day:"2-digit", month:"2-digit", year:"numeric" })}
                  </p>
                  <p className="text-sm text-gray-700">{apt.startTime}</p>
                  <div>
                    {apt.services.slice(0,2).map((s,i) => (
                      <p key={i} className="text-sm text-gray-700 truncate">{s.serviceName}</p>
                    ))}
                    {apt.services.length > 2 && <p className="text-xs text-gray-500">+{apt.services.length - 2} más</p>}
                  </div>
                  <Badge className={`${getStatusColor(apt.status)} text-[11px] px-2 py-0.5 whitespace-nowrap`}>
                    {getStatusLabel(apt.status)}
                  </Badge>
                  <div className="flex items-center justify-start lg:justify-end gap-1.5">
                    <button onClick={() => setViewingAppointment(apt)}
                      className="p-1.5 rounded-lg text-[#60A5FA] hover:bg-[#60A5FA]/10" title="Ver detalles">
                      <Edit className="w-4 h-4" />
                    </button>
                    {userRole === "admin" && (
                      <>
                        <button onClick={() => handleEdit(apt)}
                          className="p-1.5 rounded-lg text-[#FBBF24] hover:bg-[#FBBF24]/10" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setAppointmentToCancel(apt.id); setCancelDialogOpen(true); }}
                          disabled={apt.status === "cancelled"}
                          className={`p-1.5 rounded-lg transition-all ${apt.status === "cancelled" ? "text-gray-300 cursor-not-allowed" : "text-[#F87171] hover:bg-[#F87171]/10"}`}
                          title="Cancelar">
                          <XCircle className="w-4 h-4" />
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
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <button onClick={goToPreviousWeek} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center gap-3">
                  <h3 className="text-gray-900">
                    {getWeekDates()[0].toLocaleDateString("es-ES",{day:"numeric",month:"long"})} -{" "}
                    {getWeekDates()[6].toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"})}
                  </h3>
                  <Button variant="outline" size="sm" onClick={goToToday} className="border-gray-300 rounded-lg h-8 text-sm">
                    Hoy
                  </Button>
                </div>
                <button onClick={goToNextWeek} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-xs text-gray-600">Estados:</span>
                {LEGEND_ITEMS.map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded border-l-4" style={{ borderLeftColor: color, backgroundColor: color + "20" }} />
                    <span className="text-xs text-gray-700">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Cabecera días */}
                <div className="grid grid-cols-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                  <div className="p-3 border-r border-gray-200 text-gray-900">Hora</div>
                  {getWeekDates().map((date, idx) => (
                    <div key={idx} className={`p-3 border-r border-gray-200 last:border-r-0 text-center ${
                      isToday(date) ? "bg-[#78D1BD]/10" : isPastDate(date) ? "bg-gray-100" : ""
                    }`}>
                      <div className="text-sm text-gray-600">{WEEK_DAYS[idx]}</div>
                      <div className={`mt-0.5 ${isToday(date) ? "text-[#78D1BD]" : "text-gray-900"}`}>{date.getDate()}</div>
                    </div>
                  ))}
                </div>

                {/* Filas de horas */}
                {TIME_SLOTS.map(time => (
                  <div key={time} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0">
                    <div className="p-2 border-r border-gray-200 bg-gray-50/50 text-sm text-gray-600">{time}</div>
                    {getWeekDates().map((date, dIdx) => {
                      const cellApts  = getAppointmentsForCell(date, time);
                      const firstApt  = cellApts.find(a => a.startTime === time);
                      const isOccupied = cellApts.length > 0;

                      return (
                        <div key={dIdx}
                          className={`border-r border-gray-200 last:border-r-0 relative min-h-[50px] ${
                            isToday(date) ? "bg-[#78D1BD]/5" : isPastDate(date) ? "bg-gray-100" : ""
                          } ${!isOccupied && !isPastDate(date) ? "hover:bg-[#A78BFA]/10 cursor-pointer transition-colors group" : ""} ${
                            isPastDate(date) ? "cursor-not-allowed" : ""
                          }`}
                          style={{ height: "50px" }}
                          onClick={() => {
                            if (!isOccupied && !isPastDate(date)) {
                              setFormData({ ...EMPTY_FORM, date, startTime: time });
                              setIsDialogOpen(true);
                            }
                          }}
                        >
                          {!isOccupied && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                              <Plus className="w-5 h-5 text-[#A78BFA]" />
                            </div>
                          )}
                          {firstApt && (
                            <div
                              className="absolute inset-x-1 rounded-lg p-2 shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-all"
                              style={{
                                height: `${getAppointmentCellSpan(firstApt) * 50 - 4}px`,
                                backgroundColor: { pending:"#F59E0B20", cancelled:"#EF444420", completed:"#3B82F620" }[firstApt.status],
                                borderLeftColor:  { pending:"#F59E0B",   cancelled:"#EF4444",   completed:"#3B82F6"   }[firstApt.status],
                              }}
                              onClick={e => { e.stopPropagation(); setViewingAppointment(firstApt); }}
                            >
                              <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-900 truncate">{firstApt.clientName}</span>
                                  <span className={`${getStatusColor(firstApt.status)} text-[10px] px-1.5 py-0 rounded`}>
                                    {getStatusLabel(firstApt.status)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-600 mb-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{firstApt.startTime} - {firstApt.endTime}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-1">
                                  {firstApt.services.map((s,i) => (
                                    <div key={i} className="text-[10px] text-gray-700 flex items-start gap-1">
                                      <span className="w-1 h-1 rounded-full bg-gray-400 mt-1 flex-shrink-0" />
                                      <span className="truncate">{s.serviceName}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Dialogs */}
      <AppointmentViewDialog
        appointment={viewingAppointment}
        employees={employees}
        userRole={userRole}
        onClose={() => setViewingAppointment(null)}
        onEdit={handleEdit}
        onDeleteRequest={(id) => { setAppointmentToDelete(id); setDeleteDialogOpen(true); }}
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
