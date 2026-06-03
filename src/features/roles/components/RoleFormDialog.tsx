// src/features/roles/components/RoleFormDialog.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Textarea } from "../../../shared/ui/textarea";
import { Lock, Shield, Settings, ArrowRight } from "lucide-react";
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
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [tempPermisosIds,   setTempPermisosIds]   = useState<number[]>([]);

  useEffect(() => {
    if (open) setTempPermisosIds(formData.permisosIds);
  }, [open, formData.permisosIds]);

  const isBaseRole = isEditing &&
    ["administrador", "admin", "barbero", "cliente", "empleado"].includes(formData.nombre?.toLowerCase() ?? "");

  const getViewPermission = (permissions: Permission[]) =>
    permissions.find(p => p.nombre.split(".")[1] === "ver");

  const isViewEnabled = (permission: Permission, permissions: Permission[]) => {
    const action = permission.nombre.split(".")[1];
    if (action === "ver") return true;
    const viewPerm = getViewPermission(permissions);
    if (!viewPerm) return true;
    return tempPermisosIds.includes(Number(viewPerm.id));
  };

  const handleToggle = (id: string, permissions: Permission[]) => {
    const numId = Number(id);
    const permission = permissions.find(p => Number(p.id) === numId);
    if (!permission) return;
    const action   = permission.nombre.split(".")[1];
    const viewPerm = getViewPermission(permissions);
    if (action !== "ver" && viewPerm && !tempPermisosIds.includes(Number(viewPerm.id))) return;
    if (action === "ver" && tempPermisosIds.includes(numId)) {
      const categoryIds = permissions.map(p => Number(p.id));
      setTempPermisosIds(prev => prev.filter(id => !categoryIds.includes(id)));
      return;
    }
    setTempPermisosIds(prev =>
      prev.includes(numId) ? prev.filter(p => p !== numId) : [...prev, numId]
    );
  };

  const handleToggleAll = (permissions: Permission[]) => {
    const ids   = permissions.map(p => Number(p.id));
    const allOn = ids.every(id => tempPermisosIds.includes(id));
    if (allOn) {
      setTempPermisosIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setTempPermisosIds(prev => [...new Set([...prev, ...ids])]);
    }
  };

  const categoryActive  = (permissions: Permission[]) => permissions.every(p => tempPermisosIds.includes(Number(p.id)));
  const categoryPartial = (permissions: Permission[]) =>
    permissions.some(p => tempPermisosIds.includes(Number(p.id))) && !categoryActive(permissions);

  const handleSavePermissions = () => {
    setFormData((prev: any) => ({ ...prev, permisosIds: tempPermisosIds }));
    setIsPermissionsOpen(false);
  };

  return (
    <>
      {/* ── Ventana 1: Datos del rol ── */}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-lg w-full rounded-2xl p-6 bg-white shadow-xl border border-gray-100 flex flex-col gap-5">

          <div className="flex flex-col gap-1">
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1a5c3a]" />
              {isEditing ? "Editar Rol" : "Nuevo Rol"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              {isEditing ? "Modifica los datos y permisos del rol" : "Define el nombre y asigna permisos al nuevo rol"}
            </DialogDescription>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Nombre del Rol *</Label>
              <Input
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Recepcionista, Gerente..."
                className="rounded-xl border-gray-200 text-sm"
                disabled={isBaseRole}
              />
              {isBaseRole && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Nombre protegido por el sistema
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Descripción *</Label>
              <Textarea
                value={formData.descripcion}
                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe las responsabilidades de este rol. "
                rows={2}
                className="rounded-xl border-gray-200 text-sm resize-none"
              />
            </div>

            {/* Resumen de permisos + botón configurar */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#edf7f4] flex items-center justify-center border border-[#78D1BD]/30">
                  <Settings className="w-4 h-4 text-[#1a5c3a]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Permisos asignados</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formData.permisosIds.length} permiso{formData.permisosIds.length !== 1 ? "s" : ""} seleccionado{formData.permisosIds.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPermissionsOpen(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, backgroundColor: "#edf7f4", color: "#1a3a2a", fontSize: 12, fontWeight: 600, border: "1px solid #c8ead9", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#d4f0e8")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#edf7f4")}
              >
                Configurar <ArrowRight style={{ width: 13, height: 13 }} />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="outline" onClick={onClose} className="rounded-xl text-sm">Cancelar</Button>
            <Button
              onClick={onSubmit}
              style={{ backgroundColor: "#1a3a2a", color: "#fff" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
              className="rounded-xl text-sm"
            >
              {isEditing ? "Guardar Cambios" : "Crear Rol"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Ventana 2: Configuración de permisos en columnas ── */}
      <Dialog open={isPermissionsOpen} onOpenChange={() => setIsPermissionsOpen(false)}>
        <DialogContent
          className="rounded-2xl p-0 bg-white shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ maxWidth: "min(90vw, 1100px)", width: "90vw", height: "85vh" }}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#edf7f4] flex items-center justify-center border border-[#78D1BD]/30">
                <Settings className="w-4 h-4 text-[#1a5c3a]" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900">Configurar Permisos</DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                  {formData.nombre ? `Rol: "${formData.nombre}"` : "Selecciona los permisos para el nuevo rol"}
                </DialogDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTempPermisosIds(Object.values(groupedPermissions).flat().map(p => Number(p.id)))}
                style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #E5E7EB", backgroundColor: "#fff", color: "#374151", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
              >
                Activar todo
              </button>
              <button
                type="button"
                onClick={() => setTempPermisosIds([])}
                style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #E5E7EB", backgroundColor: "#fff", color: "#374151", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
              >
                Desactivar todo
              </button>
            </div>
          </div>

          {/* Grid de permisos */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {Object.keys(groupedPermissions).length === 0 ? (
              <div className="flex flex-col items-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                <Lock className="w-8 h-8 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">Cargando permisos...</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {Object.entries(groupedPermissions).map(([category, permissions]) => {
                  const allActive     = categoryActive(permissions);
                  const partialActive = categoryPartial(permissions);
                  const activeCount   = permissions.filter(p => tempPermisosIds.includes(Number(p.id))).length;

                  return (
                    <div
                      key={category}
                      style={{ backgroundColor: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                    >
                      {/* Cabecera categoría */}
                      <div style={{ padding: "10px 14px", backgroundColor: allActive ? "#edf7f4" : "#F9FAFB", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{
                            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                            backgroundColor: allActive ? "#10b981" : partialActive ? "#f59e0b" : "#D1D5DB",
                          }} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: allActive ? "#1a5c3a" : "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {parseCategory(category)}
                          </span>
                          <span style={{ fontSize: 10, color: "#6B7280", backgroundColor: "#F3F4F6", padding: "1px 6px", borderRadius: 999 }}>
                            {activeCount}/{permissions.length}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleAll(permissions)}
                          style={{
                            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, border: "none", cursor: "pointer",
                            backgroundColor: allActive ? "#c8ead9" : "#E5E7EB",
                            color: allActive ? "#1a5c3a" : "#374151",
                          }}
                        >
                          {allActive ? "Ninguno" : "Todos"}
                        </button>
                      </div>

                      {/* Permisos individuales */}
                      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                        {permissions.map(permission => {
                          const isOn    = tempPermisosIds.includes(Number(permission.id));
                          const enabled = isViewEnabled(permission, permissions);
                          const action  = permission.nombre.split(".")[1];

                          return (
                            <div
                              key={permission.id}
                              onClick={() => enabled && handleToggle(permission.id, permissions)}
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "7px 10px", borderRadius: 8, cursor: enabled ? "pointer" : "not-allowed",
                                opacity: enabled ? 1 : 0.45,
                                backgroundColor: isOn && enabled ? "#edf7f4" : "#F9FAFB",
                                border: `1px solid ${isOn && enabled ? "#c8ead9" : "#E5E7EB"}`,
                                transition: "all 0.15s",
                              }}
                              title={!enabled ? 'Activa "Ver" primero' : undefined}
                            >
                              <div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: isOn && enabled ? "#1a3a2a" : "#4B5563" }}>
                                  {parseName(permission.nombre)}
                                </span>
                                {action !== "ver" && !enabled && (
                                  <span style={{ display: "block", fontSize: 9, color: "#d97706", fontWeight: 700, marginTop: 1 }}>
                                    Requiere Ver
                                  </span>
                                )}
                              </div>
                              {/* Toggle */}
                              <div style={{
                                width: 32, height: 18, borderRadius: 999, position: "relative", flexShrink: 0,
                                backgroundColor: isOn && enabled ? "#1a3a2a" : "#D1D5DB",
                                transition: "background 0.15s",
                              }}>
                                <span style={{
                                  position: "absolute", top: 2, width: 14, height: 14, borderRadius: "50%",
                                  backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                  left: isOn && enabled ? 16 : 2,
                                  transition: "left 0.15s",
                                }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "14px 24px", borderTop: "1px solid #E5E7EB", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>
              {tempPermisosIds.length} permiso{tempPermisosIds.length !== 1 ? "s" : ""} seleccionado{tempPermisosIds.length !== 1 ? "s" : ""}
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsPermissionsOpen(false)}
                style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid #D1D5DB", backgroundColor: "#fff", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                style={{ padding: "8px 20px", borderRadius: 10, border: "none", backgroundColor: "#1a3a2a", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
              >
                Confirmar Permisos
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
