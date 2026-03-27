import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { Lock } from "lucide-react";
import { AccessPermission } from "../types";
import { getModuleColor, getActionColor } from "../utils";

interface PermissionViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  permission: AccessPermission | null;
}

export function PermissionViewDialog({ isOpen, onOpenChange, permission }: PermissionViewDialogProps) {
  if (!permission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl max-w-2xl border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Detalles del Permiso</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] flex items-center justify-center shadow-sm">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900">{permission.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${getModuleColor(permission.module)} text-xs px-2 py-0.5`}>
                  {permission.module}
                </Badge>
                <Badge className={`${getActionColor(permission.action)} text-xs px-2 py-0.5`}>
                  {permission.action}
                </Badge>
              </div>
            </div>
            <Badge
              className={`text-xs px-2 py-0.5 ${
                permission.isActive
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              {permission.isActive ? "Activo" : "Inactivo"}
            </Badge>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Descripción</p>
              <p className="text-gray-900 mt-1">{permission.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Fecha de Creación</p>
                <p className="text-gray-900 mt-1">
                  {new Date(permission.createdAt).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Asignado a</p>
                <p className="text-gray-900 mt-1">
                  {permission.rolesCount} {permission.rolesCount === 1 ? "rol" : "roles"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg border-gray-300">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}