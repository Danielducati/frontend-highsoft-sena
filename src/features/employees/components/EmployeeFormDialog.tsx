import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../shared/ui/dialog";
import { Upload, ImageIcon, X, Loader2 } from "lucide-react";
import { Employee, EmployeeFormData } from "../types";
import { DOCUMENT_TYPES, SPECIALTIES } from "../constants";
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
}

const inputBase: React.CSSProperties = {
  width: "100%", padding: "9px 14px", borderRadius: 10,
  backgroundColor: "#faf7f2", color: "#1a3a2a", fontSize: 14,
  fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box",
  transition: "border-color 0.15s",
};
const inputOk:  React.CSSProperties = { ...inputBase, border: "1px solid #d6cfc4" };
const inputErr: React.CSSProperties = { ...inputBase, border: "1px solid #c0392b", backgroundColor: "#fdf8f7" };
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600,
  letterSpacing: "0.08em", textTransform: "uppercase",
  color: "#6b7c6b", marginBottom: 5, fontFamily: "var(--font-body)",
};
const errorStyle: React.CSSProperties = {
  fontSize: 11, color: "#c0392b", marginTop: 3, fontFamily: "var(--font-body)",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s\-()\\.]{7,20}$/;
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
  if (data.phone && !PHONE_RE.test(data.phone.trim())) e.phone = "Teléfono inválido.";
  if (!data.specialty) e.specialty = "Selecciona una especialidad.";
  if (data.documentType && !data.document.trim()) e.document = "Ingresa el número de documento.";
  if (data.document.trim() && !DOC_RE.test(data.document.trim())) e.document = "Solo números, entre 5 y 15 dígitos.";
  if (!data.documentType && data.document.trim()) e.documentType = "Selecciona el tipo de documento.";
  if (isNew && data.contrasena && data.contrasena.length < 6) e.contrasena = "Mínimo 6 caracteres.";
  return e;
}

// ── Field FUERA del componente para evitar re-renders ─────────────────────
interface FieldProps {
  label: string;
  field: keyof EmployeeFormData;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}

function Field({ label, field, required, children, error }: FieldProps) {
  return (
    <div>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: "#c0392b", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <p style={errorStyle}>⚠ {error}</p>}
    </div>
  );
}

export function EmployeeFormDialog({
  isOpen, onOpenChange, editingEmployee, formData, setFormData,
  imagePreview, setImagePreview, saving, onSubmit, onCancel,
}: EmployeeFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [touched,      setTouched]      = useState<Partial<Record<keyof EmployeeFormData, boolean>>>({});
  const [uploadingImg, setUploadingImg] = useState(false);

  const touch = (field: keyof EmployeeFormData) =>
    setTouched(t => ({ ...t, [field]: true }));

  const allErrs = validate(formData, !editingEmployee);
  const liveErrors: Errors = {};
  (Object.keys(touched) as Array<keyof EmployeeFormData>).forEach(k => {
    if (touched[k] && allErrs[k]) liveErrors[k] = allErrs[k];
  });

  const s = (field: keyof EmployeeFormData) =>
    liveErrors[field] ? inputErr : inputOk;

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
      <DialogContent style={{
        backgroundColor: "#faf7f2", borderRadius: 16, border: "1px solid #ede8e0",
        padding: 32, maxWidth: 600, maxHeight: "90vh", overflowY: "auto", fontFamily: "var(--font-body)",
      }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#1a3a2a", fontWeight: "normal" }}>
            {editingEmployee ? "Editar Empleado" : "Nuevo Empleado"}
          </DialogTitle>
          <DialogDescription style={{ color: "#6b7c6b", fontSize: 13 }}>
            {editingEmployee ? "Actualiza la información del empleado" : "Ingresa los datos del nuevo empleado. Los campos con * son obligatorios."}
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}>

          {/* ── Foto ── */}
          <div>
            <label style={labelStyle}>Foto de Perfil</label>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%", overflow: "hidden",
                  border: "2px solid #d6cfc4", backgroundColor: "#edf7f4",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {uploadingImg
                    ? <Loader2 style={{ width: 24, height: 24, color: "#9ca3af" }} />
                    : imagePreview
                      ? <ImageWithFallback src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <ImageIcon style={{ width: 28, height: 28, color: "#9ca3af" }} />
                  }
                </div>
                {imagePreview && !uploadingImg && (
                  <button onClick={() => { setImagePreview(""); setFormData(p => ({ ...p, image: "" })); }} style={{
                    position: "absolute", top: -4, right: -4, width: 20, height: 20,
                    borderRadius: "50%", backgroundColor: "#c0392b", color: "#fff",
                    border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <X style={{ width: 12, height: 12 }} />
                  </button>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImg} style={{
                  ...inputOk, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  cursor: uploadingImg ? "not-allowed" : "pointer", opacity: uploadingImg ? 0.7 : 1,
                }}>
                  {uploadingImg
                    ? <><Loader2 style={{ width: 14, height: 14 }} /> Subiendo...</>
                    : <><Upload style={{ width: 14, height: 14 }} /> Subir Imagen</>
                  }
                </button>
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>JPG, PNG o WEBP (máx. 5MB)</p>
              </div>
            </div>
          </div>

          {/* ── Nombres / Apellidos ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Nombres" field="firstName" required error={liveErrors.firstName}>
              <input style={s("firstName")} value={formData.firstName} placeholder="Ana María"
                onChange={e => update("firstName", e.target.value)}
                onBlur={() => touch("firstName")} />
            </Field>
            <Field label="Apellidos" field="lastName" required error={liveErrors.lastName}>
              <input style={s("lastName")} value={formData.lastName} placeholder="García Pérez"
                onChange={e => update("lastName", e.target.value)}
                onBlur={() => touch("lastName")} />
            </Field>
          </div>

          {/* ── Documento ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Tipo de Documento" field="documentType" error={liveErrors.documentType}>
              <select style={s("documentType")} value={formData.documentType}
                onChange={e => update("documentType", e.target.value)}
                onBlur={() => touch("documentType")}>
                <option value="">Selecciona tipo</option>
                {DOCUMENT_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>
            <Field label="Número de Documento" field="document" error={liveErrors.document}>
              <input style={s("document")} value={formData.document} placeholder="1234567890"
                onChange={e => update("document", e.target.value)}
                onBlur={() => touch("document")} />
            </Field>
          </div>

          {/* ── Correo / Teléfono ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Correo" field="email" required error={liveErrors.email}>
              <input style={s("email")} type="email" value={formData.email}
                placeholder="empleado@highlifespa.com"
                onChange={e => update("email", e.target.value)}
                onBlur={() => touch("email")} />
            </Field>
            <Field label="Teléfono" field="phone" error={liveErrors.phone}>
              <input style={s("phone")} value={formData.phone} placeholder="+57 310 123 4567"
                onChange={e => update("phone", e.target.value)}
                onBlur={() => touch("phone")} />
            </Field>
          </div>

          {/* ── Ciudad / Especialidad ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Ciudad" field="city" error={liveErrors.city}>
              <input style={s("city")} value={formData.city} placeholder="Medellín"
                onChange={e => update("city", e.target.value)}
                onBlur={() => touch("city")} />
            </Field>
            <Field label="Especialidad" field="specialty" required error={liveErrors.specialty}>
              <select style={s("specialty")} value={formData.specialty}
                onChange={e => update("specialty", e.target.value)}
                onBlur={() => touch("specialty")}>
                <option value="">Selecciona especialidad</option>
                {SPECIALTIES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* ── Dirección ── */}
          <Field label="Dirección" field="address" error={liveErrors.address}>
            <input style={s("address")} value={formData.address} placeholder="Calle 123 #45-67"
              onChange={e => update("address", e.target.value)}
              onBlur={() => touch("address")} />
          </Field>

          {/* ── Contraseña (solo nuevo) ── */}
          {!editingEmployee && (
            <Field label="Contraseña inicial" field="contrasena" error={liveErrors.contrasena}>
              <input style={s("contrasena")} type="password" value={formData.contrasena}
                placeholder="empleado123 (por defecto)"
                onChange={e => update("contrasena", e.target.value)}
                onBlur={() => touch("contrasena")} />
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                Si no ingresas una, se usará "empleado123"
              </p>
            </Field>
          )}

          {/* ── Botones ── */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8 }}>
            <button onClick={handleCancel} style={{
              padding: "9px 18px", borderRadius: 10, border: "1px solid #d6cfc4",
              backgroundColor: "transparent", color: "#1a3a2a", fontSize: 14,
              fontFamily: "var(--font-body)", cursor: "pointer",
            }}>Cancelar</button>
            <button onClick={handleSubmit} disabled={saving || uploadingImg} style={{
              padding: "9px 20px", borderRadius: 10, border: "none",
              backgroundColor: (saving || uploadingImg) ? "#9ca3af" : "#1a3a2a",
              color: "#ffffff", fontSize: 14, fontWeight: 600,
              fontFamily: "var(--font-body)", cursor: (saving || uploadingImg) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}
              onMouseEnter={e => { if (!saving && !uploadingImg) e.currentTarget.style.backgroundColor = "#2a5a40"; }}
              onMouseLeave={e => { if (!saving && !uploadingImg) e.currentTarget.style.backgroundColor = "#1a3a2a"; }}
            >
              {saving && <Loader2 style={{ width: 14, height: 14 }} />}
              {saving ? "Guardando..." : `${editingEmployee ? "Actualizar" : "Crear"} Empleado`}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
