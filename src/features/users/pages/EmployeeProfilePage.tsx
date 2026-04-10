import { useState, useEffect, useRef } from "react";
import { User, Upload, Loader2, Save, X, ImageIcon, Lock } from "lucide-react";
import { SpaPage } from "../../../shared/components/layout/SpaPage";
import { toast } from "sonner";
import { uploadImage } from "../../../shared/utils/uploadImage";
import { DOCUMENT_TYPES } from "../../employees/constants";
import { changePasswordRequest } from "../../auth/services/authService";
import { fetchCategoriesApi } from "../../employees/services/employeesService";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 14px", borderRadius: 10,
  backgroundColor: "#faf7f2", color: "#1a3a2a", fontSize: 14,
  fontFamily: "var(--font-body)", outline: "none",
  border: "1px solid #d6cfc4", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600,
  letterSpacing: "0.08em", textTransform: "uppercase",
  color: "#6b7c6b", marginBottom: 5, fontFamily: "var(--font-body)",
};

export function EmployeeProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [empId,        setEmpId]        = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [categories,   setCategories]   = useState<{ id: number; nombre: string }[]>([]);

  const [form, setForm] = useState({
    firstName: "", lastName: "", documentType: "", document: "",
    email: "", phone: "", city: "", address: "", specialty: "", image: "",
  });

  // Cambio de contraseña
  const [passForm,    setPassForm]    = useState({ current: "", next: "", confirm: "" });
  const [savingPass,  setSavingPass]  = useState(false);

  useEffect(() => {
    fetchCategoriesApi().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/employees/mi-perfil`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => {
        setEmpId(Number(data.id));
        setForm({
          firstName:    data.nombre      ?? "",
          lastName:     data.apellido    ?? "",
          documentType: data.tipoDocumento   ?? "",
          document:     data.numeroDocumento ?? "",
          email:        data.email       ?? "",
          phone:        data.phone       ?? "",
          city:         data.ciudad      ?? "",
          address:      data.direccion   ?? "",
          specialty:    data.specialty   ?? "",
          image:        data.fotoPerfil  ?? data.image ?? "",
        });
        setImagePreview(data.fotoPerfil ?? data.image ?? "");
      })
      .catch(() => toast.error("Error al cargar tu perfil"))
      .finally(() => setLoading(false));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImg(true);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      const url = await uploadImage(file);
      setForm(f => ({ ...f, image: url }));
      setImagePreview(url);
      toast.success("Imagen subida correctamente");
    } catch (err: any) {
      toast.error(err.message ?? "Error al subir imagen");
    } finally {
      setUploadingImg(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!empId) return;
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      toast.error("Nombre, apellido y correo son obligatorios"); return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/employees/${empId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          nombre:           form.firstName,
          apellido:         form.lastName,
          tipo_documento:   form.documentType || null,
          numero_documento: form.document     || null,
          correo:           form.email,
          telefono:         form.phone        || null,
          ciudad:           form.city         || null,
          direccion:        form.address      || null,
          especialidad:     form.specialty    || null,
          foto_perfil:      form.image        || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Error al guardar");
      }
      toast.success("Perfil actualizado correctamente");
    } catch (err: any) {
      toast.error(err.message ?? "Error al guardar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passForm.current || !passForm.next) {
      toast.error("Completa todos los campos"); return;
    }
    if (passForm.next.length < 6) {
      toast.error("La nueva contraseña debe tener mínimo 6 caracteres"); return;
    }
    if (passForm.next !== passForm.confirm) {
      toast.error("Las contraseñas no coinciden"); return;
    }
    setSavingPass(true);
    try {
      await changePasswordRequest(passForm.current, passForm.next);
      toast.success("Contraseña actualizada correctamente");
      setPassForm({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.message ?? "Error al cambiar contraseña");
    } finally {
      setSavingPass(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500">Cargando perfil...</div>
  );

  return (
    <SpaPage
      title="Mi Perfil"
      subtitle="Actualiza tu información personal"
      icon={<User className="w-6 h-6" style={{ color: "#1a3a2a" }} />}
    >
      <div className="max-w-2xl space-y-6" style={{ fontFamily: "var(--font-body)" }}>

        {/* ── Foto ── */}
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: "#ffffff" }}>
          <p style={{ ...labelStyle, marginBottom: 16 }}>Foto de Perfil</p>
          <div className="flex items-center gap-5">
            <div style={{ position: "relative" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%", overflow: "hidden",
                border: "2px solid #d6cfc4", backgroundColor: "#edf7f4",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {uploadingImg
                  ? <Loader2 style={{ width: 28, height: 28, color: "#9ca3af" }} className="animate-spin" />
                  : imagePreview
                    ? <img src={imagePreview} alt="Perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <ImageIcon style={{ width: 32, height: 32, color: "#9ca3af" }} />
                }
              </div>
              {imagePreview && !uploadingImg && (
                <button onClick={() => { setImagePreview(""); setForm(f => ({ ...f, image: "" })); }} style={{
                  position: "absolute", top: -4, right: -4, width: 22, height: 22,
                  borderRadius: "50%", backgroundColor: "#c0392b", color: "#fff",
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <X style={{ width: 12, height: 12 }} />
                </button>
              )}
            </div>
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImg} style={{
                ...inputStyle, width: "auto", display: "inline-flex", alignItems: "center",
                gap: 8, cursor: uploadingImg ? "not-allowed" : "pointer",
              }}>
                {uploadingImg ? <><Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> Subiendo...</> : <><Upload style={{ width: 14, height: 14 }} /> Cambiar foto</>}
              </button>
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>JPG, PNG o WEBP (máx. 5MB)</p>
            </div>
          </div>
        </div>

        {/* ── Datos personales ── */}
        <div className="rounded-2xl p-6 shadow-sm space-y-4" style={{ backgroundColor: "#ffffff" }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#1a3a2a", marginBottom: 4 }}>Datos Personales</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input style={inputStyle} value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Ana" />
            </div>
            <div>
              <label style={labelStyle}>Apellido *</label>
              <input style={inputStyle} value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="García" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Tipo de Documento</label>
              <select style={inputStyle} value={form.documentType} onChange={e => setForm(f => ({ ...f, documentType: e.target.value }))}>
                <option value="">Selecciona tipo</option>
                {DOCUMENT_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Número de Documento</label>
              <input style={inputStyle} value={form.document} onChange={e => setForm(f => ({ ...f, document: e.target.value }))} placeholder="1234567890" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Correo *</label>
              <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="correo@spa.com" />
            </div>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+57 310 123 4567" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Ciudad</label>
              <input style={inputStyle} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Medellín" />
            </div>
            <div>
              <label style={labelStyle}>Especialidad</label>
              <select style={inputStyle} value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}>
                <option value="">Selecciona especialidad</option>
                {categories.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Dirección</label>
            <input style={inputStyle} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Calle 123 #45-67" />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
            <button onClick={handleSave} disabled={saving} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 22px", borderRadius: 10, border: "none",
              backgroundColor: saving ? "#9ca3af" : "#1a3a2a", color: "#fff",
              fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)",
              cursor: saving ? "not-allowed" : "pointer",
            }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = "#2a5a40"; }}
              onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = "#1a3a2a"; }}
            >
              {saving ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Save style={{ width: 14, height: 14 }} />}
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>

        {/* ── Cambiar contraseña ── */}
        <div className="rounded-2xl p-6 shadow-sm space-y-4" style={{ backgroundColor: "#ffffff" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <Lock style={{ width: 16, height: 16, color: "#6b7c6b" }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1a3a2a" }}>Cambiar Contraseña</p>
          </div>

          <div>
            <label style={labelStyle}>Contraseña Actual</label>
            <input style={inputStyle} type="password" value={passForm.current} onChange={e => setPassForm(f => ({ ...f, current: e.target.value }))} placeholder="••••••••" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Nueva Contraseña</label>
              <input style={inputStyle} type="password" value={passForm.next} onChange={e => setPassForm(f => ({ ...f, next: e.target.value }))} placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <label style={labelStyle}>Confirmar Contraseña</label>
              <input style={inputStyle} type="password" value={passForm.confirm} onChange={e => setPassForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repite la contraseña" />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
            <button onClick={handleChangePassword} disabled={savingPass} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 22px", borderRadius: 10, border: "none",
              backgroundColor: savingPass ? "#9ca3af" : "#1a3a2a", color: "#fff",
              fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)",
              cursor: savingPass ? "not-allowed" : "pointer",
            }}
              onMouseEnter={e => { if (!savingPass) e.currentTarget.style.backgroundColor = "#2a5a40"; }}
              onMouseLeave={e => { if (!savingPass) e.currentTarget.style.backgroundColor = "#1a3a2a"; }}
            >
              {savingPass ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Lock style={{ width: 14, height: 14 }} />}
              {savingPass ? "Guardando..." : "Actualizar Contraseña"}
            </button>
          </div>
        </div>

      </div>
    </SpaPage>
  );
}
