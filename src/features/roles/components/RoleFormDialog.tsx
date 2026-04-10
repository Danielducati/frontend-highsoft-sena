// src/features/roles/components/RoleFormDialog.tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Textarea } from "../../../shared/ui/textarea";
import { Lock } from "lucide-react";
import { Permission } from "../types";
import { parseName } from "../constants";

interface Props {
  open:               boolean;
  onClose:            () => void;
  onSubmit:           () => void;
  isEditing:          boolean;
  formData:           { nombre: string; descripcion: string; permisosIds: number[] };
  setFormData:        (data: any) => void;
  groupedPermissions: Record<string, Permission[]>;
}

export function RoleFormDialog({
  open, onClose, onSubmit, isEditing,
  formData, setFormData, groupedPermissions,
}: Props) {

  // Devuelve el permiso "ver" de una categoría si existe
  const getViewPermission = (permissions: Permission[]) =>
    permissions.find(p => p.nombre.split(".")[1] === "ver");

  // ¿Está habilitado el permiso "ver" de su categoría?
  const isViewEnabled = (permission: Permission, permissions: Permission[]) => {
    const action = permission.nombre.split(".")[1];
    if (action === "ver") return true; // "ver" siempre habilitado
    const viewPerm = getViewPermission(permissions);
    if (!viewPerm) return true; // si no hay "ver" en la categoría, no restringir
    return formData.permisosIds.includes(Number(viewPerm.id));
  };

  const handleToggle = (id: string, permissions: Permission[]) => {
    const numId = Number(id);
    const permission = permissions.find(p => Number(p.id) === numId);
    if (!permission) return;

    const action = permission.nombre.split(".")[1];
    const viewPerm = getViewPermission(permissions);

    // Si intenta activar un permiso que no es "ver" y "ver" no está activo → ignorar
    if (action !== "ver" && viewPerm && !formData.permisosIds.includes(Number(viewPerm.id))) return;

    // Si está desactivando "ver", también desactiva todos los demás de la categoría
    if (action === "ver" && formData.permisosIds.includes(numId)) {
      const categoryIds = permissions.map(p => Number(p.id));
      setFormData((prev: any) => ({
        ...prev,
        permisosIds: prev.permisosIds.filter((id: number) => !categoryIds.includes(id)),
      }));
      return;
    }

    setFormData((prev: any) => ({
      ...prev,
      permisosIds: prev.permisosIds.includes(numId)
        ? prev.permisosIds.filter((p: number) => p !== numId)
        : [...prev.permisosIds, numId],
    }));
  };

  const handleToggleAll = (permissions: Permission[]) => {
    const ids   = permissions.map(p => Number(p.id));
    const allOn = ids.every(id => formData.permisosIds.includes(id));

    if (allOn) {
      // Desactivar todos (incluyendo "ver")
      setFormData((prev: any) => ({
        ...prev,
        permisosIds: prev.permisosIds.filter((id: number) => !ids.includes(id)),
      }));
    } else {
      // Activar todos — solo si "ver" existe en la categoría (se activa junto con los demás)
      setFormData((prev: any) => ({
        ...prev,
        permisosIds: [...new Set([...prev.permisosIds, ...ids])],
      }));
    }
  };

  const categoryActive = (permissions: Permission[]) =>
    permissions.every(p => formData.permisosIds.includes(Number(p.id)));

  const categoryPartial = (permissions: Permission[]) =>
    permissions.some(p => formData.permisosIds.includes(Number(p.id))) &&
    !categoryActive(permissions);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="hl-form-dialog rounded-xl max-w-2xl max-h-[90vh] overflow-y-auto border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {isEditing ? "Editar Rol" : "Nuevo Rol"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isEditing ? "Actualiza la información del rol" : "Crea un nuevo rol y asigna permisos"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label className="text-gray-900">Nombre del Rol *</Label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Gerente, Recepcionista..."
              className="rounded-lg border-gray-200"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label className="text-gray-900">Descripción *</Label>
            <Textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Describe las responsabilidades de este rol..."
              rows={3}
              className="rounded-lg border-gray-200"
            />
          </div>

          {/* Permisos con toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-gray-900">Asignar Permisos *</Label>
              <span className="text-xs text-gray-500">
                {formData.permisosIds.length} permiso{formData.permisosIds.length !== 1 ? "s" : ""} seleccionado{formData.permisosIds.length !== 1 ? "s" : ""}
              </span>
            </div>

            {Object.keys(groupedPermissions).length === 0 ? (
              <div className="flex flex-col items-center py-8 rounded-xl border border-dashed border-gray-200 bg-gray-50">
                <Lock className="w-8 h-8 mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">Cargando permisos...</p>
                <p className="text-xs text-gray-400 mt-1">Si esto persiste, recarga la página</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <div key={category} className="border border-gray-200 rounded-xl overflow-hidden">

                  {/* Cabecera de categoría con toggle general */}
                  <div
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors
                      ${categoryActive(permissions)
                        ? "bg-purple-50 border-b border-purple-100"
                        : "bg-gray-50 border-b border-gray-100"
                      }`}
                    onClick={() => handleToggleAll(permissions)}
                  >
                    <div className="flex items-center gap-2">
                      {/* Indicador partial */}
                      {categoryPartial(permissions) && (
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                      <span className={`text-sm font-medium capitalize
                        ${categoryActive(permissions) ? "text-purple-700" : "text-gray-700"}`}>
                        {category}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({permissions.filter(p => formData.permisosIds.includes(Number(p.id))).length}/{permissions.length})
                      </span>
                    </div>

                    {/* Toggle general de categoría */}
                    <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                      ${categoryActive(permissions) ? "bg-purple-500" : "bg-gray-400"}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform
                        ${categoryActive(permissions) ? "translate-x-4" : "translate-x-1"}`}
                      />
                    </div>
                  </div>

                  {/* Permisos individuales */}
                  <div className="divide-y divide-gray-50">
                    {permissions.map((permission) => {
                      const isOn      = formData.permisosIds.includes(Number(permission.id));
                      const enabled   = isViewEnabled(permission, permissions);
                      const action    = permission.nombre.split(".")[1];
                      return (
                        <div
                          key={permission.id}
                          onClick={() => enabled && handleToggle(permission.id, permissions)}
                          className="flex items-center justify-between px-4 py-2.5 transition-colors"
                          style={{ cursor: enabled ? "pointer" : "not-allowed", opacity: enabled ? 1 : 0.4 }}
                          onMouseEnter={e => { if (enabled) e.currentTarget.style.backgroundColor = "#f9fafb"; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
                          title={!enabled ? `Activa el permiso "Ver" primero` : undefined}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${isOn ? "text-gray-900" : "text-gray-500"}`}>
                              {parseName(permission.nombre)}
                            </span>
                            {action !== "ver" && !enabled && (
                              <span className="text-xs text-amber-500">requiere Ver</span>
                            )}
                          </div>

                          {/* Toggle individual */}
                          <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                            ${isOn && enabled ? "bg-purple-500" : enabled ? "bg-gray-400" : "bg-gray-300"}`}>
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform
                              ${isOn && enabled ? "translate-x-4" : "translate-x-1"}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="rounded-lg border-gray-300">
              Cancelar
            </Button>
            <Button
              onClick={onSubmit}
              style={{ backgroundColor: "#1a3a2a", color: "#ffffff" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
              className="rounded-lg"
            >
              {isEditing ? "Actualizar" : "Crear"} Rol
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
