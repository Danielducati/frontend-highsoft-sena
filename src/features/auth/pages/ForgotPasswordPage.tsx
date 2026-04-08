import { useState } from "react";
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
import { Mail, Loader2, CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { forgotPasswordRequest } from "../services/authService";

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToLogin = () => {
    // 🔥 fallback si no te pasan onBack
    if (onBack) {
      onBack();
    } else {
      window.location.href = "/login";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Por favor ingresa tu correo");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor ingresa un correo válido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await forgotPasswordRequest(email);

      setSuccess(true);
      toast.success("Se envió un enlace a tu correo");

      console.log("📧 Respuesta del servidor:", data);

      if (data?.resetToken) {
        console.log("🔐 Token (solo desarrollo):", data.resetToken);
      }

    } catch (err: any) {
      const errorMsg = err.message || "Error al procesar solicitud";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#f5f0e8" }}
    >
      <Card
        className="w-full max-w-[420px] shadow-lg"
        style={{ borderRadius: 16 }}
      >
        {!success ? (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#e8f7f4" }}
                >
                  <Mail className="w-8 h-8" style={{ color: "#78D1BD" }} />
                </div>
              </div>
              <CardTitle className="text-2xl">
                ¿Olvidaste tu contraseña?
              </CardTitle>
              <CardDescription>
                Te enviaremos un enlace para restablecerla
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="space-y-2">
                  <Label style={{ color: "#1a3a2a", fontWeight: 600 }}>
                    Correo Electrónico
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div
                    className="p-3 rounded-lg text-sm flex items-center gap-2"
                    style={{
                      backgroundColor: "#fef2f2",
                      color: "#991b1b",
                      border: "1px solid #fee2e2",
                    }}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full"
                  style={{ backgroundColor: "#1a3a2a" }}
                >
                  {loading ? "Enviando..." : "Enviar Enlace"}
                </Button>

                <button
                  type="button"
                  onClick={goToLogin}
                  className="w-full text-sm flex items-center justify-center gap-1 underline"
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Login
                </button>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto" />
              <CardTitle>¡Revisa tu correo!</CardTitle>
              <CardDescription>
                Enviamos un enlace a {email}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button onClick={goToLogin} className="w-full">
                Volver al Login
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}