import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Card, CardContent } from "../../../shared/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Sparkles, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-[#78D1BD]/10 via-[#60A5FA]/10 to-[#A78BFA]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl text-gray-900">HIGHLIFE SPA & BAR</h1>
          </div>
          <div>
            <h2 className="text-xl text-gray-900">Crear Cuenta</h2>
            <p className="text-sm text-gray-600 mt-1">Completa tus datos para registrarte</p>
          </div>
        </div>

        <Card className="border-gray-200 shadow-xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-900">Nombre *</Label>
                <Input id="fullName" type="text" value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="Ingresa tu nombre" className="rounded-lg border-gray-200 h-11" disabled={loading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido" className="text-gray-900">Apellido *</Label>
                <Input id="apellido" type="text" value={formData.apellido}
                  onChange={(e) => handleChange("apellido", e.target.value)}
                  placeholder="Ingresa tu apellido" className="rounded-lg border-gray-200 h-11" disabled={loading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900">Correo Electrónico *</Label>
                <Input id="email" type="email" value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="correo@ejemplo.com" className="rounded-lg border-gray-200 h-11" disabled={loading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-900">Teléfono *</Label>
                <Input id="phone" type="tel" value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+57 300 123 4567" className="rounded-lg border-gray-200 h-11" disabled={loading} />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900">Tipo de Documento *</Label>
                <Select value={formData.tipocedula}
                  onValueChange={(value) => handleChange("tipocedula", value)} disabled={loading}>
                  <SelectTrigger className="h-11 rounded-lg border-gray-200">
                    <SelectValue placeholder="Seleccione una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cedula" className="text-gray-900">Número de Documento *</Label>
                <Input id="cedula" type="text" value={formData.cedula}
                  onChange={(e) => handleChange("cedula", e.target.value)}
                  placeholder="1234567890" className="rounded-lg border-gray-200 h-11" disabled={loading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900">Contraseña *</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Mínimo 6 caracteres" className="rounded-lg border-gray-200 h-11 pr-10" disabled={loading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-900">Confirmar Contraseña *</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    placeholder="Repite tu contraseña" className="rounded-lg border-gray-200 h-11 pr-10" disabled={loading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 rounded-lg !bg-[#00aae4] hover:!bg-[#0095c7] !text-white" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />Registrando...
                  </span>
                ) : "Registrar"}
              </Button>

              <button type="button" onClick={onBack}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
                disabled={loading}>
                <ArrowLeft className="w-4 h-4" />Volver al inicio
              </button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <button onClick={onBack} className="text-[#007BFF] hover:text-[#0056b3] transition-colors">
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
}