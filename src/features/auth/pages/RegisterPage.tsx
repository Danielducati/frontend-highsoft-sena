import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { DOCUMENT_TYPES } from "../constants";
import { RegisterPageProps } from "../types";
import { useRegister } from "../hooks/UseRegister";
import { RegisterSuccessScreen } from "../components/Registersuccessscreen";
import { GoogleAuthButton } from "../components/GoogleAuthButton";

const Err = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ color: "#e53e3e", fontSize: 10, marginTop: 2 }}>{msg}</p> : null;

const inputBase: React.CSSProperties = {
  backgroundColor: "#f5f2ed",
  border: "1px solid transparent",
  borderRadius: 8,
  height: 36,
  fontSize: 13,
  color: "#1a3a2a",
  width: "100%",
  padding: "0 10px",
  outline: "none",
  transition: "border-color 0.2s",
};

const inputErr: React.CSSProperties = {
  ...inputBase,
  border: "1px solid #e53e3e",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#8a9e8d",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  display: "block",
  marginBottom: 4,
};

export function RegisterPage({ onBack, onGoHome, onRegisterSuccess, onLogin }: RegisterPageProps) {
  const {
    formData, handleChange,
    errors,
    showSuccess, showPassword, setShowPassword,
    loading, handleSubmit, handleGoogleRegister,
  } = useRegister(onRegisterSuccess, onLogin);

  if (showSuccess) return <RegisterSuccessScreen />;

  return (
    <div style={{ minHeight: "100vh", position: "relative", fontFamily: "var(--font-body)" }}>
      {/* Fondo */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url('https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1600&q=80')`,
        backgroundSize: "cover", backgroundPosition: "center",
      }} />
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(15,35,20,0.68)" }} />

      {/* Layout */}
      <div style={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{ width: "100%", maxWidth: 960, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>

          {/* ── Columna izquierda ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <p style={{ fontSize: 11, letterSpacing: "0.28em", color: "rgba(200,169,110,0.9)", textTransform: "uppercase", marginBottom: 12 }}>
                HIGH LIFE SPA &amp; BAR
              </p>
              <h2 style={{ fontSize: 36, fontWeight: 400, fontStyle: "italic", color: "#fff", fontFamily: "var(--font-display)", lineHeight: 1.2, marginBottom: 12 }}>
                Bienvenido
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.75 }}>
                Crea tu cuenta y accede a los mejores servicios de spa y bienestar.
              </p>
            </div>

            {/* Google */}
            <div style={{ borderRadius: 14, padding: 16, backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(4px)" }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 10 }}>Registro rápido</p>
              <GoogleAuthButton onClick={handleGoogleRegister} loading={loading} disabled={loading} label="Continuar con Google" />
            </div>

            {/* Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { title: "Acceso Seguro",      desc: "Tus datos están protegidos con encriptación" },
                { title: "Reservas Fáciles",   desc: "Agenda tus citas en minutos" },
                { title: "Ofertas Exclusivas", desc: "Acceso a promociones solo para miembros" },
              ].map(({ title, desc }) => (
                <div key={title} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(120,209,189,0.15)", border: "1px solid rgba(120,209,189,0.3)" }}>
                    <span style={{ color: "#78D1BD", fontSize: 16 }}>✓</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{title}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Columna derecha — Formulario ── */}
          <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: "28px 28px 24px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <h3 style={{ fontSize: 22, fontWeight: 400, fontStyle: "italic", color: "#1a3a2a", fontFamily: "Bond", marginBottom: 4 }}>
                Crear cuenta
              </h3>
              <p style={{ fontSize: 12, color: "#8a9e8d" }}>Completa tus datos para registrarte</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Tipo documento + Número */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Tipo de documento <span style={{ color: "#e53e3e" }}>*</span></label>
                  <Select value={formData.tipocedula} onValueChange={(v) => handleChange("tipocedula", v)} disabled={loading}>
                    <SelectTrigger style={{ ...inputBase, display: "flex", alignItems: "center", cursor: "pointer" }}>
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Err msg={errors.tipocedula} />
                </div>
                <div>
                  <label style={labelStyle}>Número de documento <span style={{ color: "#e53e3e" }}>*</span></label>
                  <input maxLength={15}
                    value={formData.cedula} onChange={(e) => handleChange("cedula", e.target.value)}
                    placeholder="1234567890" disabled={loading}
                    style={errors.cedula ? inputErr : inputBase}
                    onFocus={(e) => (e.target.style.border = "1px solid #78D1BD")}
                    onBlur={(e) => (e.target.style.border = errors.cedula ? "1px solid #e53e3e" : "1px solid transparent")}
                  />
                  <Err msg={errors.cedula} />
                </div>
              </div>

              {/* Nombre + Apellido */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Nombre <span style={{ color: "#e53e3e" }}>*</span></label>
                  <input
                    value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="Juan" disabled={loading}
                    style={errors.fullName ? inputErr : inputBase}
                    onFocus={(e) => (e.target.style.border = "1px solid #78D1BD")}
                    onBlur={(e) => (e.target.style.border = errors.fullName ? "1px solid #e53e3e" : "1px solid transparent")}
                  />
                  <Err msg={errors.fullName} />
                </div>
                <div>
                  <label style={labelStyle}>Apellido <span style={{ color: "#e53e3e" }}>*</span></label>
                  <input
                    value={formData.apellido} onChange={(e) => handleChange("apellido", e.target.value)}
                    placeholder="Pérez" disabled={loading}
                    style={errors.apellido ? inputErr : inputBase}
                    onFocus={(e) => (e.target.style.border = "1px solid #78D1BD")}
                    onBlur={(e) => (e.target.style.border = errors.apellido ? "1px solid #e53e3e" : "1px solid transparent")}
                  />
                  <Err msg={errors.apellido} />
                </div>
              </div>

              {/* Correo */}
              <div>
                <label style={labelStyle}>Correo electrónico <span style={{ color: "#e53e3e" }}>*</span></label>
                <input type="email"
                  value={formData.email} onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="correo@ejemplo.com" disabled={loading}
                  style={errors.email ? inputErr : inputBase}
                  onFocus={(e) => (e.target.style.border = "1px solid #78D1BD")}
                  onBlur={(e) => (e.target.style.border = errors.email ? "1px solid #e53e3e" : "1px solid transparent")}
                />
                <Err msg={errors.email} />
              </div>

              {/* Teléfono */}
              <div>
                <label style={labelStyle}>Teléfono <span style={{ color: "#e53e3e" }}>*</span></label>
                <input type="tel" maxLength={10}
                  value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="3001234567" disabled={loading}
                  style={errors.phone ? inputErr : inputBase}
                  onFocus={(e) => (e.target.style.border = "1px solid #78D1BD")}
                  onBlur={(e) => (e.target.style.border = errors.phone ? "1px solid #e53e3e" : "1px solid transparent")}
                />
                <Err msg={errors.phone} />
              </div>

              {/* Contraseñas */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Contraseña <span style={{ color: "#e53e3e" }}>*</span></label>
                  <div style={{ position: "relative" }}>
                    <input type={showPassword ? "text" : "password"}
                      value={formData.password} onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="Mín. 6 caracteres" disabled={loading}
                      style={{ ...(errors.password ? inputErr : inputBase), paddingRight: 32 }}
                      onFocus={(e) => (e.target.style.border = "1px solid #78D1BD")}
                      onBlur={(e) => (e.target.style.border = errors.password ? "1px solid #e53e3e" : "1px solid transparent")}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading}
                      style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8a9e8d", padding: 0 }}>
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <Err msg={errors.password} />
                </div>
                <div>
                  <label style={labelStyle}>Confirmar <span style={{ color: "#e53e3e" }}>*</span></label>
                  <div style={{ position: "relative" }}>
                    <input type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      placeholder="Repite contraseña" disabled={loading}
                      style={{ ...(errors.confirmPassword ? inputErr : inputBase), paddingRight: 32 }}
                      onFocus={(e) => (e.target.style.border = "1px solid #78D1BD")}
                      onBlur={(e) => (e.target.style.border = errors.confirmPassword ? "1px solid #e53e3e" : "1px solid transparent")}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading}
                      style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8a9e8d", padding: 0 }}>
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <Err msg={errors.confirmPassword} />
                </div>
              </div>

              {/* Botón registrar */}
              <button type="submit" disabled={loading}
                style={{ width: "100%", height: 42, borderRadius: 10, backgroundColor: "#1a3a2a", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: loading ? "not-allowed" : "pointer", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s" }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#2a5a40"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1a3a2a"; }}
              >
                {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Registrando...</> : "Crear cuenta"}
              </button>

              {/* Footer */}
              <div style={{ textAlign: "center", paddingTop: 4 }}>
                <p style={{ fontSize: 12, color: "#8a9e8d" }}>
                  ¿Ya tienes cuenta?{" "}
                  <button type="button" onClick={onBack} disabled={loading}
                    style={{ color: "#1a3a2a", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: 12 }}>
                    Inicia sesión
                  </button>
                </p>
                <button type="button" onClick={onGoHome} disabled={loading}
                  style={{ marginTop: 4, fontSize: 11, color: "#b0bcb0", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  Volver al inicio
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
