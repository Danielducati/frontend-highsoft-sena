// src/features/users/components/UserFormDialog.tsx
import { RefObject } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Avatar, AvatarFallback } from "../../../shared/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { ImageWithFallback } from "../../guidelines/figma/ImageWithFallback";
import { User, Role, UserFormData } from "../types";
import { DOCUMENT_TYPES, DEFAULT_PASSWORD } from "../constants";

// ── Helpers de validación ─────────────────────────────────────
const onlyLetters = (v: string) => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
const onlyNumbers = (v: string) => v.replace(/\D/g, "");
const onlyPhone   = (v: string) => v.replace(/[^0-9+\-\s]/g, "");

interface UserFormDialogProps {
  isOpen:        boolean;
  onOpenChange:  (v: boolean) => void;
  editingUser:   User | null;
  formData:      UserFormData;
  setFormData:   (d: UserFormData) => void;
  imagePreview:  string;
  fileInputRef:  RefObject<HTMLInputElement>;
  roles:         Role[];
  onSubmit:      () => void;
  onCancel:      () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage:  () => void;
}

export function UserFormDialog({
  isOpen, onOpenChange, editingUser, formData, setFormData,
  imagePreview, fileInputRef, roles,
  onSubmit, onCancel, onImageUpload, onClearImage,
}: UserFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="hl-form-dialog rounded-xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
          <DialogDescription>{editingUser ? "Actualiza la información" : "Crea un nuevo usuario en el sistema"}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16 ring-2 ring-gray-200">
                {imagePreview
                  ? <ImageWithFallback src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  : <AvatarFallback className="bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] text-white"><ImageIcon className="w-6 h-6" /></AvatarFallback>
                }
              </Avatar>
              {imagePreview && (
                <button onClick={onClearImage} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full rounded-lg border-gray-200">
                <Upload className="w-4 h-4 mr-2" />
                {imagePreview ? "Cambiar Imagen" : "Subir Imagen"}
              </Button>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG (máx. 5MB)</p>
            </div>
          </div>

          {/* Nombre / Apellido — solo letras */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: onlyLetters(e.target.value) })}
                placeholder="Juan"
                className="rounded-lg border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label>Apellido *</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: onlyLetters(e.target.value) })}
                placeholder="Pérez"
                className="rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Documento — solo números */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Documento *</Label>
              <Select value={formData.documentType} onValueChange={(v) => setFormData({ ...formData, documentType: v })}>
                <SelectTrigger className="rounded-lg border-gray-200"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(dt => <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Número de Documento *</Label>
              <Input
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: onlyNumbers(e.target.value) })}
                placeholder="1234567890"
                className="rounded-lg border-gray-200"
                maxLength={20}
              />
            </div>
          </div>
          

          {/* Email / Teléfono */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@email.com"
                className="rounded-lg border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: onlyPhone(e.target.value) })}
                placeholder="+57 300 123 4567"
                className="rounded-lg border-gray-200"
                maxLength={15}
              />
            </div>
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <Label>Rol *</Label>
            <Select value={formData.roleId} onValueChange={(v) => setFormData({ ...formData, roleId: v })}>
              <SelectTrigger className="rounded-lg border-gray-200"><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  r.id != null ? (
                    <SelectItem key={String(r.id)} value={String(r.id)}>{r.nombre}</SelectItem>
                  ) : null
                ))}
              </SelectContent>
            </Select>
          </div>

          {!editingUser && (
            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              La contraseña inicial será <strong>{DEFAULT_PASSWORD}</strong>. El usuario podrá cambiarla después.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button onClick={onSubmit} className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] text-white">
              {editingUser ? "Actualizar" : "Crear"} Usuario
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
