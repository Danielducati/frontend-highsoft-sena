// src/features/schedules/components/ScheduleHistoryDialog.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Alert, AlertDescription } from "../../../shared/ui/alert";
import { 
  History, 
  Clock, 
  User, 
  Calendar, 
  RotateCcw, 
  Info,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { schedulesApi } from "../services/schedulesApi";

interface ScheduleHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
  weekStartDate?: string;
}

interface HistoryRecord {
  id: string;
  versionNumber: number;
  changeReason: string;
  changedBy: string;
  createdAt: string;
  scheduleSnapshot: {
    daySchedules: Array<{
      dayIndex: number;
      fecha: string;
      startTime: string;
      endTime: string;
      diaSemana: string;
    }>;
  };
}

export function ScheduleHistoryDialog({ 
  isOpen, 
  onOpenChange, 
  employeeId, 
  employeeName,
  weekStartDate 
}: ScheduleHistoryDialogProps) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && employeeId) {
      loadHistory();
    }
  }, [isOpen, employeeId, weekStartDate]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = weekStartDate 
        ? await schedulesApi.getWeekHistory(employeeId, weekStartDate)
        : await schedulesApi.getEmployeeHistory(employeeId);
      
      // Transformar los datos del backend al formato esperado por el frontend
      const transformedHistory = data.history.map((record: any) => ({
        id: record.id.toString(),
        versionNumber: record.versionNumber,
        changeReason: record.changeReason || 'Sin motivo especificado',
        changedBy: record.usuario?.correo || 'Sistema',
        createdAt: record.createdAt,
        scheduleSnapshot: typeof record.scheduleSnapshot === 'string' 
          ? JSON.parse(record.scheduleSnapshot) 
          : record.scheduleSnapshot
      }));
      
      setHistory(transformedHistory);
    } catch (error: any) {
      console.error("Error loading schedule history:", error);
      toast.error(error.message || "Error al cargar el historial del empleado.");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVersionExpansion = (versionId: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  const handleRestore = async (historyId: string) => {
    try {
      await schedulesApi.restoreFromHistory(historyId, "Restauración desde historial");
      toast.success("Horario restaurado exitosamente");
      // Recargar el historial
      loadHistory();
      // Recargar horarios globales disparando un evento
      window.dispatchEvent(new Event("schedules:reload"));
    } catch (error: any) {
      console.error("Error restoring schedule:", error);
      toast.error(error.message || "Error al restaurar el horario. Inténtalo de nuevo.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#1a5c3a]" />
            Historial de Horarios - {employeeName}
          </DialogTitle>
          <DialogDescription>
            {weekStartDate 
              ? `Historial de cambios para la semana del ${weekStartDate}`
              : "Historial completo de cambios de horario"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando historial...
            </div>
          ) : history.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No se encontraron cambios en el historial para este empleado.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {history.map((record) => (
                <Card key={record.id} className="border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVersionExpansion(record.id)}
                          className="p-1 h-auto"
                        >
                          {expandedVersions.has(record.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <div>
                          <CardTitle className="text-sm font-medium">
                            Versión {record.versionNumber}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(record.createdAt)}
                            <User className="w-3 h-3 ml-2" />
                            {record.changedBy}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {record.scheduleSnapshot.daySchedules.length} días
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(record.id)}
                          className="h-8 text-xs"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Restaurar
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Motivo:</strong> {record.changeReason}
                    </p>
                  </CardHeader>

                  {expandedVersions.has(record.id) && (
                    <CardContent className="pt-0">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#1a5c3a]" />
                          Horarios de esta versión:
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {record.scheduleSnapshot.daySchedules.map((day) => (
                            <div key={day.dayIndex} className="flex items-center gap-2 text-sm">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getDayBadgeColor(day.dayIndex)}`}
                              >
                                {day.diaSemana.slice(0, 3)}
                              </Badge>
                              <span className="text-gray-600">
                                {day.startTime} - {day.endTime}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}