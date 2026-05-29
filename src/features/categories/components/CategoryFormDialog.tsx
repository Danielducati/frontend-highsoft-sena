import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Plus } from "lucide-react";
import { Category, CategoryFormData } from "../types";
import { useState, useEffect } from "react";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  editingCategory: Category | null;
  formData: CategoryFormData;
  setFormData: (d: CategoryFormData) => void;
  onSubmit: () => void;
  onNewClick: () => void;
  userRole: string;
  canCreate?: boolean;
}

export function CategoryFormDialog({
  isOpen, onOpenChange, editingCategory, formData, setFormData, onSubmit, onNewClick, userRole, canCreate,
}: CategoryFormDialogProps) {
  const hasAccess = userRole === "admin" || canCreate;
  const [roles, setRoles] = useState<Array<{ id: number; nombre: string }>>([]);

  useEffect(() => {
    // Cargar roles de empleados
    const loadRoles = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/roles`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Error al cargar roles');
        
        const data = await response.json();
        
        // Filtrar solo roles de empleados (no Admin ni Cliente)
        const rolesEmpleados = data.filter((r: any) => !['Admin', 'Administrador', 'Cliente'].includes(r.nombre));
        setRoles(rolesEmpleados);
      } catch (error) {
        console.error('Error al cargar roles:', error);
      }
    };

    if (isOpen) {
      loadRoles();
    }
  }, [isOpen]);

  if (!hasAccess) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          onClick={onNewClick}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, backgroundColor: "#1a3a2a", color: "#ffffff", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)", border: "none", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
        >
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </button>
      </DialogTrigger>

      <DialogContent className="hl-form-dialog rounded-xl max-w-2xl max-h-[90vh] overflow-y-auto border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {editingCategory ? "Actualiza la información de la categoría" : "Crea una nueva categoría de servicios"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="cat-name" className="text-gray-900">Nombre *</Label>
            <Input
              id="cat-name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Masajes"
              className="rounded-lg border-gray-200"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="cat-desc" className="text-gray-900">Descripción</Label>
            <Input
              id="cat-desc"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe la categoría..."
              className="rounded-lg border-gray-200"
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-gray-900">Color de Identificación</Label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={formData.color}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                className="w-11 h-11 p-0.5 rounded-lg border border-gray-200 bg-white cursor-pointer"
              />
              <Input
                value={formData.color}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                placeholder="#78D1BD"
                className="rounded-lg border-gray-200 flex-1"
              />
            </div>
          </div>

          {/* Rol Asociado */}
          <div className="space-y-2">
            <Label htmlFor="cat-role" className="text-gray-900">Rol Asociado (Especialidad)</Label>
            <select
              id="cat-role"
              value={formData.rolId || ""}
              onChange={(e) => setFormData({ ...formData, rolId: e.target.value })}
              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2"
            >
              <option value="">Sin rol asociado</option>
              {roles.map((rol) => (
                <option key={rol.id} value={String(rol.id)}>
                  {rol.nombre}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Asocia esta categoría con un rol de empleado (Barbero, Cosmetóloga, etc.)
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg border-gray-300">
              Cancelar
            </Button>
            <Button
              onClick={onSubmit}
              style={{ backgroundColor: "#1a3a2a", color: "#ffffff" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
              className="rounded-lg"
            >
              {editingCategory ? "Actualizar" : "Crear Categoría"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
