import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { Shield } from "lucide-react";
import { Role } from "../types";
import { parseCategory, parseName } from "../constants";

interface Props {
  open:       boolean;
  onClose:    () => void;
  role:       Role | null;
}

export function RoleViewDialog({ open, onClose, role }: Props) {
  if (!role) return null;

  const grouped = role.permisos.reduce((acc, p) => {
    const cat = parseCategory(p.nombre);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, typeof role.permisos>);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-xl max-w-2xl border-gray-200 shadow-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Permisos del Rol</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center shadow-sm">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900">{role.nombre}</h3>
              <p className="text-sm text-gray-600">{role.descripcion}</p>
            </div>
            <Badge className={`text-xs px-2 py-0.5 ${role.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600"}`}>
              {role.isActive ? "Activo" : "Inactivo"}
            </Badge>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            <h4 className="text-gray-900 sticky top-0 bg-white pb-2">Lista de Permisos</h4>
            {Object.entries(grouped).map(([category, perms]) => (
              <div key={category} className="space-y-2">
                <h5 className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg capitalize">{category}</h5>
                <div className="grid grid-cols-2 gap-2 pl-3">
                  {perms.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm text-gray-700">{parseName(p.nombre)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-600">Total: {role.permisos?.length ?? 0} permisos asignados</p>
            <Button variant="outline" onClick={onClose} className="rounded-lg border-gray-300">Cerrar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
