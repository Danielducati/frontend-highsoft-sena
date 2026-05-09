import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../shared/ui/card";
import { Calendar, Clock, User, Scissors } from "lucide-react";

interface Appointment {
  id: number;
  fecha: string;
  hora: string;
  clienteName: string;
  employeeName: string;
  serviceName: string;
  estado: string;
}

interface UpcomingAppointmentsProps {
  data: Appointment[];
}

export function UpcomingAppointments({ data }: UpcomingAppointmentsProps) {
  const formatFecha = (fecha: string) => {
    const [year, month, day] = fecha.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
  };

  const hasValue = (v: string) => v && v !== "—";

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>
          <div className="w-1 h-6 bg-[#1a5c3a] rounded-full" />
          Próximas Citas
        </CardTitle>
        <CardDescription style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
          Siguientes {data.length} citas programadas
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <p className="text-center py-8" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
            No hay citas próximas
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50/50 transition-colors">

                {/* Ícono calendario */}
                <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#f0faf8" }}>
                  <Calendar className="w-4 h-4" style={{ color: "#1a3a2a" }} />
                </div>

                {/* Info principal */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  {/* Cliente */}
                  <p className="text-sm font-semibold truncate" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>
                    {hasValue(apt.clienteName) ? apt.clienteName : "Sin cliente"}
                  </p>

                  {/* Empleado */}
                  {hasValue(apt.employeeName) && (
                    <p className="text-xs truncate flex items-center gap-1" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
                      <User className="w-3 h-3 flex-shrink-0" />
                      {apt.employeeName}
                    </p>
                  )}

                  {/* Servicio */}
                  {hasValue(apt.serviceName) && (
                    <p className="text-xs truncate flex items-center gap-1" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>
                      <Scissors className="w-3 h-3 flex-shrink-0" style={{ color: "#1a5c3a" }} />
                      {apt.serviceName}
                    </p>
                  )}
                </div>

                {/* Fecha + hora */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>
                    {formatFecha(apt.fecha)}
                  </p>
                  <p className="text-xs flex items-center gap-1 justify-end mt-0.5" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
                    <Clock className="w-3 h-3" />{apt.hora}
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
