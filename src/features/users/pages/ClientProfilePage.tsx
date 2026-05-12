import { useState, useEffect, useRef } from "react";
import {
  User, Upload, Loader2, Save, X, ImageIcon,
  Lock, Mail, Phone, MapPin, CreditCard, Eye, EyeOff,
} from "lucide-react";
import { SpaPage } from "../../../shared/components/layout/SpaPage";
import { toast } from "sonner";
import { uploadImage } from "../../../shared/utils/uploadImage";
import { changePasswordRequest } from "../../auth/services/authService";

const API_URL = import.meta.env.VITE_API_URL ?? "https://backend-highsoft-sena-production.up.railway.app";
const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const DOCUMENT_TYPES = [
  { value: "CC",  label: "Cédula de Ciudadanía" },
  { value: "CE",  label: "Cédula de Extranjería" },
  { value: "TI",  label: "Tarjeta de Identidad"  },
  { value: "PP",  label: "Pasaporte"              },
  { value: "NIT", label: "NIT"                    },
];

/* ── shared styles ── */
const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px 9px 36px", borderRadius: 10,
  backgroundColor: "#ffffff", color: "#1a3a2a", fontSize: 13.5,
  fontFamily: "var(--font-body)", outline: "none",
  border: "1px solid #E5E7EB", boxSizing: "border-box",
  transition: "border-color 0.2s",
};
const inpNoIcon: React.CSSProperties = { ...inp, paddingLeft: 12 };
const lbl: React.CSSProperties = {
  display: "block", fontSize: 10.5, fontWeight: 700,
  letterSpacing: "0.06em", color: "#6b7c6b",
  marginBottom: 4, fontFamily: "var(--font-body)", textTransform: "uppercase",
};

function Field({
  label, icon, children,
}: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={lbl}>{label}</label>
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{
            position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            color: "#9ca3af", display: "flex", alignItems: "center",
          }}>{icon}</span>
        )}
        {children}
      </div>
    </div>
  );
}

export function ClientProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [clientId,     setClientId]     = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext,    setShowNext]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", documentType: "", document: "",
    email: "", phone: "", address: "", image: "",
  });
  const [passForm,   setPassForm]   = useState({ current: "", next: "", confirm: "" });
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/clients/mi-perfil`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => {
        setClientId(data.PK_id_cliente ?? data.id ?? null);
        setForm({
          firstName:    data.nombre            ?? data.firstName    ?? "",
          lastName:     data.apellido          ?? data.lastName     ?? "",
          documentType: data.tipo_documento    ?? data.tipoDocumento ?? "",
          document:     data.numero_documento  ?? data.numeroDocumento ?? "",
          email:        data.correo            ?? data.email        ?? "",
          phone:        data.telefono          ?? data.phone        ?? "",
          address:      data.direccion         ?? data.address      ?? "",
          image:        data.foto_perfil       ?? data.fotoPerfil   ?? data.image ?? "",
        });
        setImagePreview(data.foto_perfil ?? data.fotoPerfil ?? data.image ?? "");
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
    if (!clientId) { toast.error("No se encontró tu perfil de cliente"); return; }
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Nombre y apellido son obligatorios"); return;
    }
    setSaving(true);
    try {
      const body = JSON.stringify({
        // Enviamos las llaves en español e inglés para máxima compatibilidad con el backend
        nombre:           form.firstName,
        apellido:         form.lastName,
        tipo_documento:   form.documentType || null,
        numero_documento: form.document     || null,
        telefono:         form.phone        || null,
        direccion:        form.address      || null,
        foto_perfil:      form.image        || null,
        firstName:        form.firstName,
        lastName:         form.lastName,
        documentType:     form.documentType || null,
        document:         form.document     || null,
        phone:            form.phone        || null,
        address:          form.address      || null,
        image:            form.image        || null,
      });

      const res = await fetch(`${API_URL}/clients/mi-perfil`, {
        method: "PATCH", headers: authHeaders(), body,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? err.message ?? `Error ${res.status} al guardar`);
      }

      // Sincronizar foto y nombre en localStorage → Header los refleja
      try {
        const stored = JSON.parse(localStorage.getItem("usuario") ?? "{}");
        if (form.image)     stored.foto     = form.image;
        if (form.firstName) stored.nombre   = form.firstName;
        if (form.lastName)  stored.apellido = form.lastName;
        localStorage.setItem("usuario", JSON.stringify(stored));
        window.dispatchEvent(new Event("usuario-updated"));
      } catch { /* silencioso */ }

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

  const initials = `${form.firstName.charAt(0)}${form.lastName.charAt(0)}`.toUpperCase() || "?";

  return (
    <SpaPage
      title="Mi Perfil"
      subtitle="Administra tu información personal y seguridad"
      icon={<User className="w-6 h-6" style={{ color: "#1a3a2a" }} />}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 20,
          alignItems: "stretch",
          fontFamily: "var(--font-body)",
          width: "100%",
        }}
      >
        {/* ══════════════════════════════════════════
            TARJETA 1 — Foto de Perfil
        ══════════════════════════════════════════ */}
        <div style={{
          backgroundColor: "#ffffff", borderRadius: 16,
          padding: "28px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 16,
        }}>
          {/* Avatar */}
          <div style={{ position: "relative" }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%", overflow: "hidden",
              border: "3px solid #E5E7EB", backgroundColor: "#edf7f4",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(26,58,42,0.12)",
            }}>
              {uploadingImg
                ? <Loader2 style={{ width: 32, height: 32, color: "#9ca3af" }} className="animate-spin" />
                : imagePreview
                  ? <img src={imagePreview} alt="Perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : (
                    <span style={{
                      fontSize: 32, fontWeight: 700, color: "#1a3a2a",
                      fontFamily: "var(--font-body)", userSelect: "none",
                    }}>{initials}</span>
                  )
              }
            </div>
            {imagePreview && !uploadingImg && (
              <button
                onClick={() => { setImagePreview(""); setForm(f => ({ ...f, image: "" })); }}
                title="Quitar foto"
                style={{
                  position: "absolute", top: 2, right: 2, width: 22, height: 22,
                  borderRadius: "50%", backgroundColor: "#c0392b", color: "#fff",
                  border: "2px solid #fff", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <X style={{ width: 11, height: 11 }} />
              </button>
            )}
          </div>

          {/* Nombre */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1a3a2a", lineHeight: 1.3 }}>
              {form.firstName || "—"} {form.lastName}
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>{form.email}</p>
          </div>

          {/* Botón subir foto */}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImg}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "8px 18px", borderRadius: 10, border: "1px solid #E5E7EB",
              backgroundColor: "#f9fafb", color: "#1a3a2a",
              fontSize: 13, fontWeight: 600, fontFamily: "var(--font-body)",
              cursor: uploadingImg ? "not-allowed" : "pointer",
              width: "100%", justifyContent: "center",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => { if (!uploadingImg) { e.currentTarget.style.backgroundColor = "#f0faf4"; e.currentTarget.style.borderColor = "#1a3a2a"; } }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#f9fafb"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
          >
            {uploadingImg
              ? <><Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> Subiendo...</>
              : <><Upload style={{ width: 13, height: 13 }} /> Cambiar foto</>
            }
          </button>
          <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: -8 }}>
            JPG, PNG o WEBP · máx. 5 MB
          </p>
        </div>

        {/* ══════════════════════════════════════════
            TARJETA 2 — Datos Personales
        ══════════════════════════════════════════ */}
        <div style={{
          backgroundColor: "#ffffff", borderRadius: 16,
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          padding: "24px 24px",
          display: "flex", flexDirection: "column",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: "#edf7f4",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <User style={{ width: 15, height: 15, color: "#1a3a2a" }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1a3a2a" }}>Datos Personales</p>
                <p style={{ fontSize: 11.5, color: "#9ca3af" }}>Actualiza tu información de perfil</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1 }}>

              <Field label="Nombre *" icon={<User style={{ width: 13, height: 13 }} />}>
                <input
                  style={inp}
                  value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  placeholder="Juan"
                  onFocus={e => e.currentTarget.style.borderColor = "#1a3a2a"}
                  onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
                />
              </Field>

              <Field label="Apellido *" icon={<User style={{ width: 13, height: 13 }} />}>
                <input
                  style={inp}
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  placeholder="Pérez"
                  onFocus={e => e.currentTarget.style.borderColor = "#1a3a2a"}
                  onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
                />
              </Field>

              <Field label="Tipo de Documento" icon={<CreditCard style={{ width: 13, height: 13 }} />}>
                <select
                  style={inp}
                  value={form.documentType}
                  onChange={e => setForm(f => ({ ...f, documentType: e.target.value }))}
                  onFocus={e => e.currentTarget.style.borderColor = "#1a3a2a"}
                  onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
                >
                  <option value="">Selecciona tipo</option>
                  {DOCUMENT_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Número de Documento" icon={<CreditCard style={{ width: 13, height: 13 }} />}>
                <input
                  style={inp}
                  value={form.document}
                  onChange={e => setForm(f => ({ ...f, document: e.target.value }))}
                  placeholder="1234567890"
                  onFocus={e => e.currentTarget.style.borderColor = "#1a3a2a"}
                  onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
                />
              </Field>

              <Field label="Correo (no editable)" icon={<Mail style={{ width: 13, height: 13 }} />}>
                <input
                  style={{ ...inp, backgroundColor: "#F3F4F6", color: "#9ca3af", cursor: "default" }}
                  value={form.email}
                  readOnly
                  title="El correo no se puede cambiar desde aquí"
                />
              </Field>

              <Field label="Teléfono" icon={<Phone style={{ width: 13, height: 13 }} />}>
                <input
                  style={inp}
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+57 300 123 4567"
                  onFocus={e => e.currentTarget.style.borderColor = "#1a3a2a"}
                  onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
                />
              </Field>

              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Dirección" icon={<MapPin style={{ width: 13, height: 13 }} />}>
                  <input
                    style={inp}
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Calle 123 #45-67, Medellín"
                    onFocus={e => e.currentTarget.style.borderColor = "#1a3a2a"}
                    onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
                  />
                </Field>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto", paddingTop: 18 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "10px 22px", borderRadius: 10, border: "none",
                  backgroundColor: saving ? "#9ca3af" : "#1a3a2a", color: "#fff",
                  fontSize: 13.5, fontWeight: 600, fontFamily: "var(--font-body)",
                  cursor: saving ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = "#2a5a40"; }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = "#1a3a2a"; }}
              >
                {saving ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Save style={{ width: 14, height: 14 }} />}
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>

        {/* ══════════════════════════════════════════
            TARJETA 3 — Cambiar Contraseña
        ══════════════════════════════════════════ */}
        <div style={{
          backgroundColor: "#ffffff", borderRadius: 16,
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          padding: "24px 24px",
          display: "flex", flexDirection: "column",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: "#fef3c7",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Lock style={{ width: 15, height: 15, color: "#92400e" }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1a3a2a" }}>Cambiar Contraseña</p>
                <p style={{ fontSize: 11.5, color: "#9ca3af" }}>Mínimo 6 caracteres</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1 }}>

              {/* Contraseña actual — full width */}
              <div style={{ gridColumn: "span 2" }}>
                <Field label="Contraseña Actual">
                  <input
                    style={inpNoIcon}
                    type={showCurrent ? "text" : "password"}
                    value={passForm.current}
                    onChange={e => setPassForm(f => ({ ...f, current: e.target.value }))}
                    placeholder="••••••••"
                    onFocus={e => e.currentTarget.style.borderColor = "#1a3a2a"}
                    onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(v => !v)}
                    style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0,
                    }}
                  >
                    {showCurrent ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                  </button>
                </Field>
              </div>

              <Field label="Nueva Contraseña">
                <input
                  style={inpNoIcon}
                  type={showNext ? "text" : "password"}
                  value={passForm.next}
                  onChange={e => setPassForm(f => ({ ...f, next: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  onFocus={e => e.currentTarget.style.borderColor = "#1a3a2a"}
                  onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
                />
                <button
                  type="button"
                  onClick={() => setShowNext(v => !v)}
                  style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0,
                  }}
                >
                  {showNext ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                </button>
              </Field>

              <Field label="Confirmar Contraseña">
                <input
                  style={inpNoIcon}
                  type={showConfirm ? "text" : "password"}
                  value={passForm.confirm}
                  onChange={e => setPassForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="Repite la contraseña"
                  onFocus={e => e.currentTarget.style.borderColor = "#1a3a2a"}
                  onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0,
                  }}
                >
                  {showConfirm ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                </button>
              </Field>

              {/* Indicador de fuerza de contraseña */}
              {passForm.next && (
                <div style={{ gridColumn: "span 2" }}>
                  {(() => {
                    const len = passForm.next.length;
                    const strength = len < 6 ? 0 : len < 9 ? 1 : len < 12 ? 2 : 3;
                    const labels = ["Muy corta", "Débil", "Media", "Fuerte"];
                    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
                    return (
                      <div>
                        <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                          {[0, 1, 2, 3].map(i => (
                            <div key={i} style={{
                              flex: 1, height: 4, borderRadius: 2,
                              backgroundColor: i <= strength ? colors[strength] : "#E5E7EB",
                              transition: "background 0.3s",
                            }} />
                          ))}
                        </div>
                        <p style={{ fontSize: 11, color: colors[strength] }}>{labels[strength]}</p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto", paddingTop: 18 }}>
              <button
                onClick={handleChangePassword}
                disabled={savingPass}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "10px 22px", borderRadius: 10, border: "none",
                  backgroundColor: savingPass ? "#9ca3af" : "#92400e", color: "#fff",
                  fontSize: 13.5, fontWeight: 600, fontFamily: "var(--font-body)",
                  cursor: savingPass ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => { if (!savingPass) e.currentTarget.style.backgroundColor = "#78350f"; }}
                onMouseLeave={e => { if (!savingPass) e.currentTarget.style.backgroundColor = "#92400e"; }}
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
