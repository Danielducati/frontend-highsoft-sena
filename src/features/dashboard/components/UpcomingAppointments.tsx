import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../shared/ui/card";
import { Calendar, User, Clock } from "lucide-react";

interface Appointment {
  id: number;
  fecha: string;
  hora: string;
  clienteName: string;
  employeeName: string;
  estado: string;
}

interface UpcomingAppointmentsProps {
  data: Appointment[];
}

export function UpcomingAppointments({ data }: UpcomingAppointmentsProps) {
  const formatFecha = (fecha: string) => {
    // fecha ya viene como "YYYY-MM-DD" desde el backend
    const [year, month, day] = fecha.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
  };

  const formatHora = (hora: string) => {
    if (!hora || hora === "—") return "—";
    // hora ya viene como "HH:mm" desde el backend
    return hora;
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>
          <div className="w-1 h-6 bg-[#78D1BD] rounded-full" />
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
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#f0faf8" }}>
                  <Calendar className="w-5 h-5" style={{ color: "#1a3a2a" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>
                    {apt.clienteName}
                  </p>
                  <p className="text-xs truncate" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
                    <User className="w-3 h-3 inline mr-1" />{apt.employeeName}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>
                    {formatFecha(apt.fecha)}
                  </p>
                  <p className="text-xs flex items-center gap-1 justify-end" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
                    <Clock className="w-3 h-3" />{formatHora(apt.hora)}
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
