// src/features/clients/components/ClientFormDialog.tsx
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Avatar, AvatarFallback } from "../../../shared/ui/avatar";
import { Plus, Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { Client, ClientFormData } from "../types";
import { DOCUMENT_TYPES } from "../constants";
import { ImageWithFallback } from "../../guidelines/figma/ImageWithFallback";
import { toast } from "sonner";
import { uploadImage } from "../../../shared/utils/uploadImage";

interface ClientFormDialogProps {
  isOpen:          boolean;
  onOpenChange:    (v: boolean) => void;
  editingClient:   Client | null;
  formData:        ClientFormData;
  setFormData:     (d: ClientFormData) => void;
  imagePreview:    string;
  setImagePreview: (v: string) => void;
  onSubmit:        () => void;
  onCancel:        () => void;
  onNewClick:      () => void;
}

// ── Helpers de validación ─────────────────────────────────────
const onlyLetters   = (v: string) => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
const onlyNumbers   = (v: string) => v.replace(/\D/g, "");
const onlyPhone     = (v: string) => v.replace(/[^0-9+\-\s]/g, "");

export function ClientFormDialog({
  isOpen, onOpenChange, editingClient, formData, setFormData,
  imagePreview, setImagePreview, onSubmit, onCancel, onNewClick,
}: ClientFormDialogProps) {
  const fileInputRef              = useRef<HTMLInputElement>(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImg(true);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      const url = await uploadImage(file);
      setFormData({ ...formData, image: url });
      setImagePreview(url);
      toast.success("Imagen subida correctamente");
    } catch (err: any) {
      toast.error(err.message ?? "Error al subir imagen");
      setImagePreview("");
    } finally {
      setUploadingImg(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, backgroundColor: "#1a3a2a", color: "#ffffff", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)", border: "none", cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2a5a40"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1a3a2a"}
          onClick={onNewClick}
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo Cliente
        </button>
      </DialogTrigger>
      <DialogContent className="hl-form-dialog rounded-xl max-w-3xl max-h-[90vh] overflow-y-auto border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">{editingClient ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
          <DialogDescription className="text-gray-600">
            {editingClient ? "Actualiza la información del cliente" : "Ingresa los datos del nuevo cliente"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Imagen */}
          <div className="space-y-2">
            <Label className="text-gray-900">Foto del Cliente</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 ring-2 ring-gray-200">
                  {uploadingImg ? (
                    <AvatarFallback className="bg-gray-100"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></AvatarFallback>
                  ) : imagePreview ? (
                    <ImageWithFallback src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] text-white text-xl"><ImageIcon className="w-8 h-8" /></AvatarFallback>
                  )}
                </Avatar>
                {imagePreview && !uploadingImg && (
                  <button onClick={() => { setImagePreview(""); setFormData({ ...formData, image: "" }); }} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Button type="button" variant="outline" disabled={uploadingImg} onClick={() => fileInputRef.current?.click()} className="w-full rounded-lg border-gray-200">
                  {uploadingImg ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Subiendo...</> : <><Upload className="w-4 h-4 mr-2" />{imagePreview ? "Cambiar Imagen" : "Subir Imagen"}</>}
                </Button>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG o WEBP (máx. 5MB)</p>
              </div>
            </div>
          </div>

          {/* Documento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-900">Tipo de Documento *</Label>
              <Select value={formData.documentType} onValueChange={v => setFormData({ ...formData, documentType: v })}>
                <SelectTrigger className="rounded-lg border-gray-200"><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="document" className="text-gray-900">Número de Documento *</Label>
              <Input
                id="document"
                value={formData.document}
                onChange={e => setFormData({ ...formData, document: onlyNumbers(e.target.value) })}
                placeholder="1234567890"
                className="rounded-lg border-gray-200"
                maxLength={20}
              />
            </div>
          </div>

          {/* Nombre / Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-900">Nombre *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: onlyLetters(e.target.value) })}
                placeholder="Juan"
                className="rounded-lg border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-900">Apellido *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: onlyLetters(e.target.value) })}
                placeholder="Pérez García"
                className="rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Teléfono / Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-900">Teléfono *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: onlyPhone(e.target.value) })}
                placeholder="+57 300 123 4567"
                className="rounded-lg border-gray-200"
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="cliente@ejemplo.com"
                className="rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-900">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Calle 123 #45-67, Bogotá"
              className="rounded-lg border-gray-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onCancel} className="rounded-lg border-gray-300">Cancelar</Button>
            <Button
              onClick={onSubmit}
              disabled={uploadingImg}
              style={{ backgroundColor: "#1a3a2a", color: "#ffffff" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
              className="rounded-lg"
            >
              {editingClient ? "Actualizar" : "Crear"} Cliente
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
