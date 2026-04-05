import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Textarea } from "../../../shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { AccessPermission, PermissionFormData } from "../types";
import { MODULES, ACTIONS } from "../constants";

interface PermissionFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingPermission: AccessPermission | null;
  formData: PermissionFormData;
  setFormData: (data: PermissionFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function PermissionFormDialog({
  isOpen,
  onOpenChange,
  editingPermission,
  formData,
  setFormData,
  onSubmit,
  onCancel,
}: PermissionFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="hl-form-dialog rounded-xl max-w-2xl border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {editingPermission ? "Editar Permiso" : "Nuevo Permiso"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {editingPermission
              ? "Actualiza la información del permiso"
              : "Crea un nuevo permiso de acceso"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-900">Nombre del Permiso *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Ver Dashboard, Crear Servicios..."
              className="rounded-lg border-gray-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-900">Módulo *</Label>
              <Select
                value={formData.module}
                onValueChange={(value) => setFormData({ ...formData, module: value })}
              >
                <SelectTrigger className="rounded-lg border-gray-200">
                  <SelectValue placeholder="Seleccionar módulo" />
                </SelectTrigger>
                <SelectContent>
                  {MODULES.map((module) => (
                    <SelectItem key={module} value={module}>{module}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-900">Acción *</Label>
              <Select
                value={formData.action}
                onValueChange={(value) => setFormData({ ...formData, action: value })}
              >
                <SelectTrigger className="rounded-lg border-gray-200">
                  <SelectValue placeholder="Seleccionar acción" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIONS.map((action) => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-900">Descripción *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe qué permite hacer este permiso..."
              rows={3}
              className="rounded-lg border-gray-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onCancel} className="rounded-lg border-gray-300">
              Cancelar
            </Button>
            <Button
              onClick={onSubmit}
              className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white rounded-lg"
            >
              {editingPermission ? "Actualizar" : "Crear"} Permiso
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
