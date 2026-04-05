import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Eye, EyeOff, HelpCircle, Loader2 } from "lucide-react";
import { DOCUMENT_TYPES } from "../constants";
import { RegisterPageProps } from "../types";
import { useRegister } from "../hooks/UseRegister";
import { RegisterSuccessScreen } from "../components/Registersuccessscreen";

export function RegisterPage({ onBack, onRegisterSuccess }: RegisterPageProps) {
  const {
    formData, handleChange,
    showSuccess, showPassword, setShowPassword,
    loading, handleSubmit,
  } = useRegister(onRegisterSuccess);

  if (showSuccess) return <RegisterSuccessScreen />;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f5f0e8", fontFamily: "var(--font-display)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-end px-10 pt-8">
        <button
          type="button"
          className="w-8 h-8 inline-flex items-center justify-center rounded-full"
          style={{ color: "#6b7c6b" }}
          aria-label="Ayuda"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Contenedor principal - 2 Columnas */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Columna Izquierda - Información */}
          <div className="flex flex-col justify-center">
            <div className="space-y-6">
              <div>
                <h2
                  className="text-4xl font-normal mb-3"
                  style={{ color: "#1a3a2a", fontFamily: "var(--font-display)" }}
                >
                  Bienvenido a Highlife Spa
                </h2>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}
                >
                  Crea tu cuenta y accede a los mejores servicios de spa y bienestar. 
                  Disfruta de promociones exclusivas y reserva tus tratamientos favoritos.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#edf7f4" }}
                  >
                    <span style={{ color: "#1a5c3a", fontSize: "20px" }}>✓</span>
                  </div>
                  <div>
                    <h3
                      className="font-semibold text-sm mb-1"
                      style={{ color: "#1a3a2a" }}
                    >
                      Acceso Seguro
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: "#6b7c6b" }}
                    >
                      Tus datos están protegidos con encriptación
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#edf7f4" }}
                  >
                    <span style={{ color: "#1a5c3a", fontSize: "20px" }}>✓</span>
                  </div>
                  <div>
                    <h3
                      className="font-semibold text-sm mb-1"
                      style={{ color: "#1a3a2a" }}
                    >
                      Reservas Fáciles
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: "#6b7c6b" }}
                    >
                      Agenda tus citas en minutos
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#edf7f4" }}
                  >
                    <span style={{ color: "#1a5c3a", fontSize: "20px" }}>✓</span>
                  </div>
                  <div>
                    <h3
                      className="font-semibold text-sm mb-1"
                      style={{ color: "#1a3a2a" }}
                    >
                      Ofertas Exclusivas
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: "#6b7c6b" }}
                    >
                      Acceso a promociones solo para miembros
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Formulario */}
          <div className="flex items-center justify-center">
            <Card
              className="border shadow-lg w-full"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#ede8e0",
                borderRadius: 16,
              }}
            >
              <CardHeader className="text-center pb-4"> 
                <CardTitle
                  className="text-2xl font-normal"
                  style={{ color: "#1a3a2a", fontFamily: "var(--font-display)" }}
                >
                  Crear cuenta
                </CardTitle>
                <CardDescription
                  className="text-xs"
                  style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}
                >
                  Completa tus datos para registrarte
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2 pb-8">
                <form onSubmit={handleSubmit} className="space-y-4" style={{ fontFamily: "var(--font-body)" }}>
                  {/* Fila 1 - Nombre y Apellido */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-[10px] tracking-[0.18em]" style={{ color: "#6b7c6b" }}>
                        NOMBRE
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        placeholder="Nombre"
                        className="h-10 rounded-lg border-0 text-sm"
                        style={{ backgroundColor: "#ece7df", color: "#1a3a2a" }}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="apellido" className="text-[10px] tracking-[0.18em]" style={{ color: "#6b7c6b" }}>
                        APELLIDO
                      </Label>
                      <Input
                        id="apellido"
                        type="text"
                        value={formData.apellido}
                        onChange={(e) => handleChange("apellido", e.target.value)}
                        placeholder="Apellido"
                        className="h-10 rounded-lg border-0 text-sm"
                        style={{ backgroundColor: "#ece7df", color: "#1a3a2a" }}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[10px] tracking-[0.18em]" style={{ color: "#6b7c6b" }}>
                      CORREO ELECTRONICO
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="h-10 rounded-lg border-0 text-sm"
                      style={{ backgroundColor: "#ece7df", color: "#1a3a2a" }}
                      disabled={loading}
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-[10px] tracking-[0.18em]" style={{ color: "#6b7c6b" }}>
                      TELEFONO
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+57 300 123 4567"
                      className="h-10 rounded-lg border-0 text-sm"
                      style={{ backgroundColor: "#ece7df", color: "#1a3a2a" }}
                      disabled={loading}
                    />
                  </div>

                  {/* Fila 2 - Tipo de Documento y Número */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] tracking-[0.18em]" style={{ color: "#6b7c6b" }}>
                        TIPO DOCUMENTO
                      </Label>
                      <Select
                        value={formData.tipocedula}
                        onValueChange={(value) => handleChange("tipocedula", value)}
                        disabled={loading}
                      >
                        <SelectTrigger
                          className="h-10 rounded-lg border-0 text-sm"
                          style={{ backgroundColor: "#ece7df", color: "#1a3a2a" }}
                        >
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_TYPES.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cedula" className="text-[10px] tracking-[0.18em]" style={{ color: "#6b7c6b" }}>
                        NUMERO
                      </Label>
                      <Input
                        id="cedula"
                        type="text"
                        value={formData.cedula}
                        onChange={(e) => handleChange("cedula", e.target.value)}
                        placeholder="1234567890"
                        className="h-10 rounded-lg border-0 text-sm"
                        style={{ backgroundColor: "#ece7df", color: "#1a3a2a" }}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-[10px] tracking-[0.18em]" style={{ color: "#6b7c6b" }}>
                      CONTRASENA
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        placeholder="Minimo 6 caracteres"
                        className="h-10 rounded-lg border-0 pr-10 text-sm"
                        style={{ backgroundColor: "#ece7df", color: "#1a3a2a" }}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: "#6b7c6b" }}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar Contraseña */}
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-[10px] tracking-[0.18em]" style={{ color: "#6b7c6b" }}>
                      CONFIRMAR CONTRASENA
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        placeholder="Repite tu contrasena"
                        className="h-10 rounded-lg border-0 pr-10 text-sm"
                        style={{ backgroundColor: "#ece7df", color: "#1a3a2a" }}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: "#6b7c6b" }}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Botón Registrar */}
                  <Button
                    type="submit"
                    className="w-full h-11 rounded-lg mt-6"
                    style={{
                      backgroundColor: "#1a3a2a",
                      color: "#ffffff",
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a5a40")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registrando...
                      </span>
                    ) : (
                      "Registrar"
                    )}
                  </Button>

                  {/* Links */}
                  <div className="pt-4 text-center space-y-2">
                    <p className="text-xs" style={{ color: "#6b7c6b" }}>
                      ¿Ya tienes cuenta?{" "}
                      <button
                        type="button"
                        onClick={onBack}
                        className="underline-offset-4 hover:underline font-medium"
                        style={{ color: "#1a3a2a" }}
                        disabled={loading}
                      >
                        Inicia sesión
                      </button>
                    </p>
                    <button
                      type="button"
                      onClick={onBack}
                      className="text-xs underline-offset-4 hover:underline block w-full"
                      style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}
                      disabled={loading}
                    >
                      Volver al inicio
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}