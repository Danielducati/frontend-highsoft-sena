import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Textarea } from "../../../shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Plus, Pencil, Upload, Image as ImageIcon, X, Clock, DollarSign, Tag, Save, Loader2 } from "lucide-react";
import { ImageWithFallback } from "../../guidelines/figma/ImageWithFallback";
import { Service, ServiceFormData } from "../types";
import { toast } from "sonner";
import { uploadImage } from "../../../shared/utils/uploadImage";

interface ServiceFormDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  editingService: Service | null;
  formData: ServiceFormData;
  setFormData: (d: ServiceFormData) => void;
  imagePreview: string;
  setImagePreview: (v: string) => void;
  categories: any[];
  onSubmit: () => void;
  onCancel: () => void;
  onNewClick: () => void;
  userRole: string;
}

export function ServiceFormDialog({
  isOpen, onOpenChange, editingService, formData, setFormData,
  imagePreview, setImagePreview, categories,
  onSubmit, onCancel, onNewClick, userRole,
}: ServiceFormDialogProps) {
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (userRole !== "admin") return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      // Preview local mientras sube
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      // Subir a Cloudinary
      const url = await uploadImage(file);
      setFormData({ ...formData, image: url });
      setImagePreview(url);
      toast.success("Imagen subida correctamente");
    } catch (err: any) {
      toast.error(err.message ?? "Error al subir imagen");
      setImagePreview("");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClearImage = () => {
    setImagePreview("");
    setFormData({ ...formData, image: "" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          onClick={onNewClick}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Agregar Servicio</span>
        </button>
      </DialogTrigger>
      <DialogContent className="hl-form-dialog max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingService
              ? <><Pencil className="w-5 h-5 text-[#78D1BD]" />Editar Servicio</>
              : <><Plus   className="w-5 h-5 text-[#78D1BD]" />Nuevo Servicio</>}
          </DialogTitle>
          <DialogDescription>
            {editingService ? "Actualiza la información del servicio" : "Completa los datos del nuevo servicio"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Imagen */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#78D1BD]" />
              Imagen del Servicio
            </Label>
            <div className="flex flex-col gap-4">
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-[#78D1BD]/20">
                  <ImageWithFallback src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                  <button onClick={handleClearImage} className="absolute top-3 right-3 p-2 bg-[#F87171] text-white rounded-full hover:bg-[#EF4444] transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-[#78D1BD] hover:bg-[#78D1BD]/5 transition-colors">
                  {uploading
                    ? <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#78D1BD] animate-spin" />
                    : <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  }
                  <p className="text-gray-900 mb-1">{uploading ? "Subiendo imagen..." : "Click para subir imagen"}</p>
                  <p className="text-sm text-gray-600">PNG, JPG hasta 5MB</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex-1">
                  {uploading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Subiendo...</>
                    : <><Upload className="w-4 h-4 mr-2" />{imagePreview ? "Cambiar Imagen" : "Seleccionar Imagen"}</>
                  }
                </Button>
                {imagePreview && (
                  <Button type="button" variant="outline" onClick={handleClearImage}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Campos */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Tag className="w-4 h-4 text-[#78D1BD]" />Nombre del Servicio *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: Masaje Relajante Premium" className="border-gray-300" />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe el servicio, beneficios, técnicas..." rows={4} className="border-gray-300 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#78D1BD]" />Duración (minutos) *</Label>
                <Input type="number" min="1" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })} placeholder="60" className="border-gray-300" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-[#78D1BD]" />Precio *</Label>
                <Input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} placeholder="100.00" className="border-gray-300" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select
                value={formData.FK_categoria_servicios}
                onValueChange={(value) => {
                  const cat = categories.find(c => c.id.toString() === value);
                  setFormData({ ...formData, FK_categoria_servicios: value, category: cat?.nombre || cat?.name || "" });
                }}
              >
                <SelectTrigger className="border-gray-300"><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                <SelectContent>
                  {categories.filter(cat => cat.id != null).map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || "#78D1BD" }} />
                        <span>{cat.nombre ?? cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button onClick={onSubmit} disabled={uploading} className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white">
              <Save className="w-4 h-4 mr-2" />
              {editingService ? "Guardar Cambios" : "Crear Servicio"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
