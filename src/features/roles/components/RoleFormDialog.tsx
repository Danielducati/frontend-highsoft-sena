// src/features/roles/components/RoleFormDialog.tsx
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Textarea } from "../../../shared/ui/textarea";
import { Lock, Shield } from "lucide-react";
import { Permission } from "../types";
import { parseName, parseCategory } from "../constants";

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

  const isBaseRole = isEditing && ["administrador", "admin", "barbero", "babero", "cliente"].includes(formData.nombre?.toLowerCase() ?? "");

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

  const totalPerms = Object.values(groupedPermissions).flat().length;
  const selectedCount = formData.permisosIds.length;
  const percentage = totalPerms > 0 ? Math.round((selectedCount / totalPerms) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="fixed inset-0 z-50 flex flex-col w-screen h-screen max-w-none max-h-none m-0 p-0 border-none rounded-none bg-slate-50 overflow-hidden translate-x-0 translate-y-0 top-0 left-0 sm:max-w-none gap-0">
        
        {/* Header Superior Premium */}
        <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200/80 flex-shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#edf7f4] flex items-center justify-center border border-[#78D1BD]/25">
              <Shield className="w-5 h-5 text-[#1a5c3a]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 leading-tight">
                {isEditing ? `Editar Rol: ${formData.nombre}` : "Crear Nuevo Rol"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5 font-medium">
                {isEditing 
                  ? "Modifica el alcance de este rol y actualiza sus permisos asignados en tiempo real." 
                  : "Define las responsabilidades e introduce un rol personalizado a la plataforma."}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-3 pr-8">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="rounded-xl border-slate-300 px-5 text-sm font-semibold hover:bg-slate-50 hover:text-slate-950 transition-colors"
            >
              Cancelar
            </Button>
            <Button
              onClick={onSubmit}
              style={{ backgroundColor: "#1a3a2a", color: "#ffffff" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
              className="rounded-xl px-6 text-sm font-semibold shadow-sm transition-all hover:scale-[1.01]"
            >
              {isEditing ? "Guardar Cambios" : "Crear Rol"}
            </Button>
          </div>
        </div>

        {/* Workspace de doble panel */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Panel Lateral Izquierdo: Información del Rol */}
          <div className="w-full lg:w-[380px] xl:w-[420px] border-r border-slate-200/80 bg-white p-8 overflow-y-auto flex flex-col justify-between flex-shrink-0">
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detalles del Rol</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Ingresa un nombre descriptivo y una justificación clara de sus funciones en la plataforma.
                </p>
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nombre del Rol *</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Administrador, Barber, Recepcionista..."
                  className="rounded-xl border-slate-200 focus:border-[#78D1BD] focus:ring-1 focus:ring-[#78D1BD] w-full"
                  disabled={isBaseRole}
                  title={isBaseRole ? "No se puede cambiar el nombre de un rol base del sistema" : undefined}
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Descripción *</Label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describe las facultades y alcances de este rol..."
                  rows={4}
                  className="rounded-xl border-slate-200 focus:border-[#78D1BD] focus:ring-1 focus:ring-[#78D1BD] w-full resize-none leading-relaxed"
                />
              </div>

              {/* Advertencia de Rol Base */}
              {isBaseRole && (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-3 mt-4">
                  <Lock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Rol Base Protegido</h5>
                    <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                      Este rol es esencial para la lógica de negocio y su nombre no puede ser modificado. No obstante, puedes configurar libremente su combinación de permisos.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Resumen de Selección e Indicador Visual */}
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resumen de Privilegios</h5>
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">Nivel de Acceso</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#edf7f4] text-[#1a5c3a]">
                    {percentage}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#78D1BD] to-[#1a5c3a] transition-all duration-300 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Restringido</span>
                  <span>Acceso Total</span>
                </div>
              </div>
              
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Permisos Asignados</span>
                <span className="text-xs font-bold text-slate-700">
                  {selectedCount} de {totalPerms}
                </span>
              </div>
            </div>

          </div>

          {/* Panel Derecho: Cuadrícula de Asignación de Permisos */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8 md:p-10">
            <div className="max-w-7xl mx-auto space-y-6">
              
              {/* Encabezado y Acciones Rápidas */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Configuración de Privilegios por Módulo</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Habilita o deshabilita los permisos específicos. Para operar cualquier módulo, es obligatorio activar la casilla "Ver" correspondiente.
                  </p>
                </div>
                
                <div className="flex gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = Object.values(groupedPermissions).flat().map(p => Number(p.id));
                      setFormData((prev: any) => ({ ...prev, permisosIds: allIds }));
                    }}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-2xs cursor-pointer"
                  >
                    Activar Todo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev: any) => ({ ...prev, permisosIds: [] }));
                    }}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-2xs cursor-pointer"
                  >
                    Desactivar Todo
                  </button>
                </div>
              </div>

              {Object.keys(groupedPermissions).length === 0 ? (
                <div className="flex flex-col items-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 shadow-xs">
                  <Lock className="w-12 h-12 text-slate-300 animate-bounce mb-3" />
                  <p className="text-sm font-bold text-slate-700">Sincronizando permisos...</p>
                  <p className="text-xs text-slate-400 mt-1">Cargando el catálogo de permisos disponibles desde el sistema.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Object.entries(groupedPermissions).map(([category, permissions]) => {
                    const isAllActive = categoryActive(permissions);
                    const isPartialActive = categoryPartial(permissions);
                    const activeCount = permissions.filter(p => formData.permisosIds.includes(Number(p.id))).length;
                    
                    return (
                      <div 
                        key={category} 
                        className="flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 group overflow-hidden"
                      >
                        {/* Cabecera del Módulo */}
                        <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isAllActive ? (
                              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] flex-shrink-0" />
                            ) : isPartialActive ? (
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 flex-shrink-0" />
                            )}
                            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider truncate">
                              {parseCategory(category)}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200/60 text-slate-600">
                              {activeCount}/{permissions.length}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleAll(permissions)}
                            className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all hover:bg-slate-200 border-none cursor-pointer"
                            style={{
                              backgroundColor: isAllActive ? "#edf7f4" : "#f1f5f9",
                              color: isAllActive ? "#1a5c3a" : "#475569",
                            }}
                          >
                            {isAllActive ? "Ninguno" : "Todos"}
                          </button>
                        </div>

                        {/* Lista de Permisos en dos columnas */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {permissions.map((permission) => {
                              const isOn = formData.permisosIds.includes(Number(permission.id));
                              const enabled = isViewEnabled(permission, permissions);
                              const action = permission.nombre.split(".")[1];
                              
                              return (
                                <div
                                  key={permission.id}
                                  onClick={() => enabled && handleToggle(permission.id, permissions)}
                                  className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 select-none relative group/item
                                    ${isOn && enabled
                                      ? "bg-[#edf7f4]/45 border-[#78D1BD]/40 text-slate-900 shadow-2xs hover:bg-[#edf7f4]/75"
                                      : enabled
                                        ? "bg-white border-slate-200/70 text-slate-700 hover:bg-slate-50/70 hover:border-slate-300"
                                        : "bg-slate-50/50 border-slate-100 text-slate-400"
                                    }`}
                                  style={{
                                    cursor: enabled ? "pointer" : "not-allowed",
                                  }}
                                  title={!enabled ? `Activa el permiso "Ver" primero` : undefined}
                                >
                                  <div className="flex flex-col min-w-0 pr-2">
                                    <span className={`text-xs font-bold leading-tight truncate ${isOn && enabled ? "text-slate-900" : "text-slate-600"}`}>
                                      {parseName(permission.nombre)}
                                    </span>
                                    {action !== "ver" && !enabled && (
                                      <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider mt-1 flex items-center gap-0.5">
                                        <Lock className="w-2.5 h-2.5" /> Requiere ver
                                      </span>
                                    )}
                                  </div>

                                  {/* Toggle switch visual */}
                                  <div
                                    className="relative inline-flex h-5 w-8.5 flex-shrink-0 items-center rounded-full transition-colors duration-200"
                                    style={{ 
                                      backgroundColor: isOn && enabled 
                                        ? "#1a3a2a" 
                                        : !enabled 
                                          ? "#e2e8f0" 
                                          : "#cbd5e1" 
                                    }}
                                  >
                                    <span
                                      className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 shadow-xs"
                                      style={{ 
                                        transform: isOn && enabled 
                                          ? "translateX(1rem)" 
                                          : "translateX(0.15rem)" 
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}
