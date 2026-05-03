import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Avatar, AvatarFallback } from "../../../shared/ui/avatar";
import { Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { Employee, EmployeeFormData } from "../types";
import { DOCUMENT_TYPES } from "../constants";
import { ImageWithFallback } from "../../guidelines/figma/ImageWithFallback";
import { toast } from "sonner";
import { uploadImage } from "../../../shared/utils/uploadImage";

interface EmployeeFormDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  editingEmployee: Employee | null;
  formData: EmployeeFormData;
  setFormData: React.Dispatch<React.SetStateAction<EmployeeFormData>>;
  imagePreview: string;
  setImagePreview: (v: string) => void;
  saving: boolean;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  categories: { value: string; label: string }[];
  onResetPassword?: (id: number, password: string) => Promise<void>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10}$/;
const DOC_RE   = /^\d{5,15}$/;

type Errors = Partial<Record<keyof EmployeeFormData, string>>;

function validate(data: EmployeeFormData, isNew: boolean): Errors {
  const e: Errors = {};
  if (!data.firstName.trim()) e.firstName = "El nombre es obligatorio.";
  else if (data.firstName.trim().length < 2) e.firstName = "Debe tener al menos 2 caracteres.";
  if (!data.lastName.trim()) e.lastName = "El apellido es obligatorio.";
  else if (data.lastName.trim().length < 2) e.lastName = "Debe tener al menos 2 caracteres.";
  if (!data.email.trim()) e.email = "El correo es obligatorio.";
  else if (!EMAIL_RE.test(data.email.trim())) e.email = "Correo inválido. Ej: nombre@dominio.com";
  if (data.phone && !PHONE_RE.test(data.phone.trim())) e.phone = "El teléfono debe tener exactamente 10 dígitos.";
  if (!data.city?.trim()) e.city = "La ciudad es obligatoria.";
  if (!data.specialty) e.specialty = "Selecciona una especialidad.";
  if (!data.documentType) e.documentType = "Selecciona el tipo de documento.";
  if (!data.document.trim()) e.document = "El número de documento es obligatorio.";
  else if (!DOC_RE.test(data.document.trim())) e.document = "Solo números, entre 5 y 15 dígitos.";
  if (isNew && data.contrasena && data.contrasena.length < 6) e.contrasena = "Mínimo 6 caracteres.";
  return e;
}

export function EmployeeFormDialog({
  isOpen, onOpenChange, editingEmployee, formData, setFormData,
  imagePreview, setImagePreview, saving, onSubmit, onCancel, categories, onResetPassword,
}: EmployeeFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [touched,       setTouched]       = useState<Partial<Record<keyof EmployeeFormData, boolean>>>({});
  const [uploadingImg,  setUploadingImg]  = useState(false);
  const [newPassword,   setNewPassword]   = useState("");
  const [resettingPass, setResettingPass] = useState(false);

  const touch = (field: keyof EmployeeFormData) =>
    setTouched(t => ({ ...t, [field]: true }));

  const allErrs = validate(formData, !editingEmployee);
  const liveErrors: Errors = {};
  (Object.keys(touched) as Array<keyof EmployeeFormData>).forEach(k => {
    if (touched[k] && allErrs[k]) liveErrors[k] = allErrs[k];
  });

  const update = (field: keyof EmployeeFormData, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImg(true);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, image: url }));
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

  const handleSubmit = () => {
    const errs = validate(formData, !editingEmployee);
    setTouched(Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    if (Object.keys(errs).length > 0) {
      toast.error("Revisa los campos marcados en rojo.");
      return;
    }
    onSubmit(formData);
  };

  const handleCancel = () => {
    setTouched({});
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="hl-form-dialog rounded-xl max-w-2xl max-h-[90vh] overflow-y-auto border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {editingEmployee ? "Editar Empleado" : "Nuevo Empleado"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {editingEmployee
              ? "Actualiza la información del empleado"
              : "Ingresa los datos del nuevo empleado. Los campos con * son obligatorios."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">

          {/* Foto */}
          <div className="space-y-2">
            <Label className="text-gray-900">Foto de Perfil</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 ring-2 ring-gray-200">
                  {uploadingImg ? (
                    <AvatarFallback className="bg-gray-100">
                      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                    </AvatarFallback>
                  ) : imagePreview ? (
                    <ImageWithFallback src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] text-white text-xl">
                      <ImageIcon className="w-8 h-8" />
                    </AvatarFallback>
                  )}
                </Avatar>
                {imagePreview && !uploadingImg && (
                  <button
                    onClick={() => { setImagePreview(""); setFormData(p => ({ ...p, image: "" })); }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingImg}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-lg border-gray-200"
                >
                  {uploadingImg
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Subiendo...</>
                    : <><Upload className="w-4 h-4 mr-2" />{imagePreview ? "Cambiar Imagen" : "Subir Imagen"}</>
                  }
                </Button>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG o WEBP (máx. 5MB)</p>
              </div>
            </div>
          </div>

          {/* Documento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-900">Tipo de Documento *</Label>
              <Select
                value={formData.documentType}
                onValueChange={v => { update("documentType", v); touch("documentType"); }}
              >
                <SelectTrigger className={`rounded-lg ${liveErrors.documentType ? "border-red-500" : "border-gray-200"}`}>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {liveErrors.documentType && (
                <p className="text-xs text-red-500">⚠ {liveErrors.documentType}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="document" className="text-gray-900">Número de Documento *</Label>
              <Input
                id="document"
                value={formData.document}
                onChange={e => update("document", e.target.value.replace(/\D/g, ""))}
                onBlur={() => touch("document")}
                placeholder="1234567890"
                className={`rounded-lg ${liveErrors.document ? "border-red-500" : "border-gray-200"}`}
                maxLength={15}
              />
              {liveErrors.document && (
                <p className="text-xs text-red-500">⚠ {liveErrors.document}</p>
              )}
            </div>
          </div>

          {/* Nombres / Apellidos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-900">Nombres *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={e => update("firstName", e.target.value)}
                onBlur={() => touch("firstName")}
                placeholder="Ana María"
                className={`rounded-lg ${liveErrors.firstName ? "border-red-500" : "border-gray-200"}`}
              />
              {liveErrors.firstName && (
                <p className="text-xs text-red-500">⚠ {liveErrors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-900">Apellidos *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={e => update("lastName", e.target.value)}
                onBlur={() => touch("lastName")}
                placeholder="García Pérez"
                className={`rounded-lg ${liveErrors.lastName ? "border-red-500" : "border-gray-200"}`}
              />
              {liveErrors.lastName && (
                <p className="text-xs text-red-500">⚠ {liveErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Correo / Teléfono */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900">Correo *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => update("email", e.target.value)}
                onBlur={() => touch("email")}
                placeholder="empleado@highlifespa.com"
                className={`rounded-lg ${liveErrors.email ? "border-red-500" : "border-gray-200"}`}
              />
              {liveErrors.email && (
                <p className="text-xs text-red-500">⚠ {liveErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-900">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={e => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                onBlur={() => touch("phone")}
                placeholder="+57 310 123 4567"
                className={`rounded-lg ${liveErrors.phone ? "border-red-500" : "border-gray-200"}`}
                maxLength={10}
              />
              {liveErrors.phone && (
                <p className="text-xs text-red-500">⚠ {liveErrors.phone}</p>
              )}
            </div>
          </div>

          {/* Ciudad / Especialidad */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-gray-900">Ciudad *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={e => update("city", e.target.value)}
                onBlur={() => touch("city")}
                placeholder="Medellín"
                className={`rounded-lg ${liveErrors.city ? "border-red-500" : "border-gray-200"}`}
              />
              {liveErrors.city && (
                <p className="text-xs text-red-500">⚠ {liveErrors.city}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900">Especialidad *</Label>
              <Select
                value={formData.specialty}
                onValueChange={v => { update("specialty", v); touch("specialty"); }}
              >
                <SelectTrigger className={`rounded-lg ${liveErrors.specialty ? "border-red-500" : "border-gray-200"}`}>
                  <SelectValue placeholder="Selecciona especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {liveErrors.specialty && (
                <p className="text-xs text-red-500">⚠ {liveErrors.specialty}</p>
              )}
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-900">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={e => update("address", e.target.value)}
              placeholder="Calle 123 #45-67"
              className="rounded-lg border-gray-200"
            />
          </div>

          {/* Contraseña (solo nuevo) */}
          {!editingEmployee && (
            <div className="space-y-2">
              <Label htmlFor="contrasena" className="text-gray-900">Contraseña inicial</Label>
              <Input
                id="contrasena"
                type="password"
                value={formData.contrasena}
                onChange={e => update("contrasena", e.target.value)}
                onBlur={() => touch("contrasena")}
                placeholder="Por defecto: número de documento"
                className={`rounded-lg ${liveErrors.contrasena ? "border-red-500" : "border-gray-200"}`}
              />
              {liveErrors.contrasena
                ? <p className="text-xs text-red-500">⚠ {liveErrors.contrasena}</p>
                : <p className="text-xs text-gray-400">Si no ingresas una, se usará el número de documento como contraseña.</p>
              }
            </div>
          )}

          {/* Reset contraseña (solo edición) */}
          {editingEmployee && onResetPassword && (
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 space-y-2">
              <Label className="text-gray-900">Cambiar Contraseña</Label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Nueva contraseña (mín. 6 caracteres)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="rounded-lg border-gray-200 flex-1"
                />
                <Button
                  type="button"
                  disabled={resettingPass || newPassword.trim().length < 6}
                  onClick={async () => {
                    setResettingPass(true);
                    await onResetPassword(Number(editingEmployee.id), newPassword.trim());
                    setNewPassword("");
                    setResettingPass(false);
                  }}
                  style={{ backgroundColor: "#1a3a2a", color: "#ffffff" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
                  className="rounded-lg whitespace-nowrap"
                >
                  {resettingPass ? "Guardando..." : "Actualizar"}
                </Button>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} className="rounded-lg border-gray-300">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || uploadingImg}
              style={{ backgroundColor: "#1a3a2a", color: "#ffffff" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
              className="rounded-lg"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {saving ? "Guardando..." : `${editingEmployee ? "Actualizar" : "Crear"} Empleado`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
