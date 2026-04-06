//components/NewsDetailDialog.tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button";
import { AlertCircle } from "lucide-react";
import { EmployeeNews } from "../types";
import { getTypeConfig, getTypeColor, getStatusColor, getStatusLabel, formatDate } from "../utils";

interface NewsDetailDialogProps {
  news:    EmployeeNews | null;
  onClose: () => void;
}

export function NewsDetailDialog({ news, onClose }: NewsDetailDialogProps) {
  if (!news) return null;
  const cfg      = getTypeConfig(news.type);
  const TypeIcon = cfg.icon;

  return (
    <Dialog open={!!news} onOpenChange={onClose}>
      <DialogContent className="hl-form-dialog max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#A78BFA]" />
            Detalles de la Novedad
          </DialogTitle>
          <DialogDescription>Información completa de la novedad registrada</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-3">
            <TypeIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
            <h3 className="text-gray-900">{news.employeeName}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Tipo</p>
              <Badge variant="outline" className={`${getTypeColor(news.type)} text-xs px-2 py-1`}>{cfg.label}</Badge>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Estado</p>
              <Badge className={`${getStatusColor(news.status)} text-xs px-2 py-1`}>{getStatusLabel(news.status)}</Badge>
            </div>
            <div>
              <p className="text-xs text-gray-600">Fecha Inicio</p>
              <p className="text-sm text-gray-900">{formatDate(news.date)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Fecha Final</p>
              <p className="text-sm text-gray-900">{formatDate(news.fechaFinal ?? "")}</p>
            </div>
            {(news.startTime || news.endTime) && (
              <>
                <div>
                  <p className="text-xs text-gray-600">Hora Inicio</p>
                  <p className="text-sm text-gray-900">{news.startTime || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Hora Final</p>
                  <p className="text-sm text-gray-900">{news.endTime || "—"}</p>
                </div>
              </>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Descripción</p>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{news.description}</p>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button onClick={onClose}
            variant="default" 
            // className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] text-white"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

