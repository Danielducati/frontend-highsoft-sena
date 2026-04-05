//components/NewsStatusDialog.tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../shared/ui/alert-dialog";
import { Label } from "../../../shared/ui/label";
import { Badge } from "../../../shared/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { RefreshCw } from "lucide-react";
import { EmployeeNews } from "../types";
import { getStatusColor, getStatusLabel, formatDate, getTypeConfig } from "../utils";

interface NewsStatusDialogProps {
  open:           boolean;
  news:           EmployeeNews | null;
  status:         EmployeeNews["status"];
  onStatusChange: (v: EmployeeNews["status"]) => void;
  onConfirm:      () => void;
  onCancel:       () => void;
}

export function NewsStatusDialog({ open, news, status, onStatusChange, onConfirm, onCancel }: NewsStatusDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#A78BFA]" />Cambiar Estado
          </AlertDialogTitle>
          <AlertDialogDescription>Selecciona el nuevo estado para esta novedad.</AlertDialogDescription>
        </AlertDialogHeader>
        {news && (
          <div className="space-y-4 py-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-900">{news.employeeName}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {getTypeConfig(news.type).label} — {formatDate(news.date)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600">Estado Actual</Label>
                <Badge className={`${getStatusColor(news.status)} text-xs px-2.5 py-1 mt-1 block w-fit`}>
                  {getStatusLabel(news.status)}
                </Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Nuevo Estado</Label>
                <Select value={status} onValueChange={(v: any) => onStatusChange(v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="aprobada">Aprobada</SelectItem>
                    <SelectItem value="rechazada">Rechazada</SelectItem>
                    <SelectItem value="resuelta">Resuelta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-gradient-to-r from-[#A78BFA] to-[#9370DB]">
            Cambiar Estado
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

