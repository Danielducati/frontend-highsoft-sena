import { useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Avatar, AvatarFallback } from "../../../shared/ui/avatar";
import { Plus, Upload, Image as ImageIcon, X } from "lucide-react";
import { Client, ClientFormData } from "../types";
import { DOCUMENT_TYPES } from "../constants";
import { ImageWithFallback } from "../../guidelines/figma/ImageWithFallback";

interface ClientFormDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  editingClient: Client | null;
  formData: ClientFormData;
  setFormData: (d: ClientFormData) => void;
  imagePreview: string;
  setImagePreview: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onNewClick: () => void;
}

export function ClientFormDialog({
  isOpen, onOpenChange, editingClient, formData, setFormData,
  imagePreview, setImagePreview, onSubmit, onCancel, onNewClick,
}: ClientFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5000000) {
      import("sonner").then(({ toast }) => toast.error("La imagen no debe superar los 5MB"));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setFormData({ ...formData, image: result });
      import("sonner").then(({ toast }) => toast.success("Imagen cargada exitosamente"));
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 10,
            backgroundColor: "#1a3a2a",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "sans-serif",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a5a40")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
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
                  {imagePreview ? (
                    <ImageWithFallback src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] text-white text-xl">
                      <ImageIcon className="w-8 h-8" />
                    </AvatarFallback>
                  )}
                </Avatar>
                {imagePreview && (
                  <button
                    onClick={() => { setImagePreview(""); setFormData({ ...formData, image: "" }); }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full rounded-lg border-gray-200">
                  <Upload className="w-4 h-4 mr-2" />
                  {imagePreview ? "Cambiar Imagen" : "Subir Imagen"}
                </Button>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG o GIF (máx. 5MB)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-900">Nombre *</Label>
              <Input id="firstName" value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Juan" className="rounded-lg border-gray-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-900">Apellido *</Label>
              <Input id="lastName" value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Pérez García" className="rounded-lg border-gray-200" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-900">Tipo de Documento *</Label>
              <Select value={formData.documentType} onValueChange={(v) => setFormData({ ...formData, documentType: v })}>
                <SelectTrigger className="rounded-lg border-gray-200">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="document" className="text-gray-900">Número de Documento *</Label>
              <Input id="document" value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                placeholder="1234567890" className="rounded-lg border-gray-200" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-900">Teléfono *</Label>
              <Input id="phone" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+57 300 123 4567" className="rounded-lg border-gray-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900">Email *</Label>
              <Input id="email" type="email" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="cliente@ejemplo.com" className="rounded-lg border-gray-200" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-900">Dirección</Label>
            <Input id="address" value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Calle 123 #45-67, Bogotá" className="rounded-lg border-gray-200" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onCancel} className="rounded-lg border-gray-300">Cancelar</Button>
            <Button onClick={onSubmit} className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white rounded-lg">
              {editingClient ? "Actualizar" : "Crear"} Cliente
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}