// frontend-highsoft-sena/src/features/appointments/pages/ClientAppointmentsPage.tsx
import { useState } from "react";
import { Card, CardContent } from "../../../shared/ui/card";
import { Badge } from "../../../shared/ui/badge";
import { Plus, CalendarIcon, Clock, Scissors, Eye } from "lucide-react";
import { SpaPage } from "../../../shared/components/layout/SpaPage";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentFormDialog } from "../components/AppointmentFormDialog";
import { AppointmentViewDialog } from "../components/AppointmentViewDialog";
import { CancelAppointmentDialog } from "../components/ConfirmDialogs";
import { getStatusColor, getStatusLabel } from "../utils";

export function ClientAppointmentsPage() {
  const {
    services, employees, clients, loading, appointments,
    isDialogOpen, setIsDialogOpen,
    editingAppointment, viewingAppointment, setViewingAppointment,
    cancelDialogOpen, setCancelDialogOpen, setAppointmentToCancel,
    formData, setFormData, selectedServices, currentService, setCurrentService,
    getEmployeesByCategory,
    handleAddService, handleRemoveService,
    handleCreateOrUpdate, handleCancelAppointment,
    resetForm, handleClientChange, handleStartTimeChange,
  } = useAppointments("client");

  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = appointments.filter(a =>
    filterStatus === "all" || a.status === filterStatus
  );

  const upcoming = filtered.filter(a => a.status === "pending");
  const past     = filtered.filter(a => a.status !== "pending");

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500">Cargando tus citas...</div>
  );

  return (
    <SpaPage
      title="Mis Citas"
      subtitle="Gestiona y agenda tus citas en el spa"
      icon={<CalendarIcon className="w-5 h-5 text-[#78D1BD]" />}
      action={
        <button
          onClick={() => { resetForm(); setIsDialogOpen(true); }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, backgroundColor: "#1a3a2a", color: "#ffffff", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)", border: "none", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
        >
          <Plus className="w-4 h-4" />
          Agendar Cita
        </button>
      }
    >
      <div className="space-y-6">

        {/* Próximas citas */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
            Próximas citas ({upcoming.length})
          </h2>
          {upcoming.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="p-10 text-center">
                <CalendarIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500" style={{ fontFamily: "var(--font-body)" }}>No tienes citas próximas</p>
                <p className="text-sm text-gray-400 mt-1" style={{ fontFamily: "var(--font-body)" }}>¡Agenda una ahora!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcoming.map(apt => (
                <Card key={apt.id} className="border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#f0faf8" }}>
                          <CalendarIcon className="w-6 h-6" style={{ color: "#1a3a2a" }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>
                              {apt.date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                            </p>
                            <Badge className={`${getStatusColor(apt.status)} text-xs px-2 py-0.5`}>
                              {getStatusLabel(apt.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />{apt.startTime} – {apt.endTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Scissors className="w-3.5 h-3.5" />
                              {apt.services.map(s => s.serviceName).join(", ") || "Sin servicios"}
                            </span>
                          </div>
                          {apt.services[0]?.employeeName && (
                            <p className="text-xs mt-1" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
                              Atendido por: {apt.services[0].employeeName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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
                        <button
                          onClick={() => { setAppointmentToCancel(apt.id); setCancelDialogOpen(true); }}
                          title="Cancelar cita"
                          className="p-2 rounded-lg transition-colors text-xs"
                          style={{ color: "#c0392b", fontFamily: "var(--font-body)" }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fdf0ee")}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Historial */}
        {past.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
              Historial ({past.length})
            </h2>
            <div className="space-y-2">
              {past.map(apt => (
                <Card key={apt.id} className="border-gray-200 opacity-75">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#f5f5f5" }}>
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
                            {apt.date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                            <span className="ml-2 text-xs">• {apt.startTime}</span>
                          </p>
                          <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-body)" }}>
                            {apt.services.map(s => s.serviceName).join(", ") || "Sin servicios"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(apt.status)} text-xs px-2 py-0.5`}>
                          {getStatusLabel(apt.status)}
                        </Badge>
                        <button
                          onClick={() => setViewingAppointment(apt)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "#6b7c6b" }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
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
        onStartTimeChange={handleStartTimeChange}
        onSubmit={handleCreateOrUpdate}
        onCancel={resetForm}
        userRole="client"
      />
      <AppointmentViewDialog
        appointment={viewingAppointment}
        employees={employees}
        userRole="client"
        onClose={() => setViewingAppointment(null)}
        onEdit={() => {}}
        onDeleteRequest={() => {}}
        onUpdateStatus={() => {}}
      />
      <CancelAppointmentDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelAppointment}
      />
    </SpaPage>
  );
}
