import { useState, useEffect } from "react";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../shared/ui/card";
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { resetPasswordRequest } from "../services/authService";

export function ResetPasswordPage() {

  // 🔥 Obtener token desde la URL manualmente
  const getTokenFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token");
  };

  const token = getTokenFromURL();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Token inválido o inexistente. El enlace ha expirado.");
    }
  }, [token]);

  const goToLogin = () => {
    window.location.href = "/login";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token inválido");
      return;
    }

    if (!password || !confirmPassword) {
      toast.error("Completa todos los campos");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await resetPasswordRequest(token, password);

      setSuccess(true);
      toast.success("Contraseña actualizada correctamente");

      setTimeout(() => {
        goToLogin();
      }, 3000);

    } catch (err: any) {
      const errorMsg = err.message || "Error al cambiar contraseña";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (error && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f5f0e8" }}>
        <Card className="w-full max-w-[420px] shadow-lg border-red-200" style={{ borderRadius: 16 }}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#fee2e2" }}>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl">Enlace Expirado</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Solicita un nuevo enlace desde login.
            </p>

            <Button onClick={goToLogin} className="w-full" style={{ backgroundColor: "#1a3a2a" }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f5f0e8" }}>
      <Card className="w-full max-w-[420px] shadow-lg" style={{ borderRadius: 16 }}>
        {!success ? (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Cambiar Contraseña</CardTitle>
              <CardDescription>Ingresa tu nueva contraseña</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                />

                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmar contraseña"
                />

                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Cambiar contraseña"}
                </Button>

                <button type="button" onClick={goToLogin}>
                  Volver al Login
                </button>

              </form>
            </CardContent>
          </>
        ) : (
          <CardContent className="text-center">
            <CheckCircle className="w-8 h-8 mx-auto" />
            <p>Contraseña actualizada</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}