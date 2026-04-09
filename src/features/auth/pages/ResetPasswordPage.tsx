import { useState, useEffect } from "react";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../shared/ui/card";
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { validateResetTokenRequest, resetPasswordRequest } from "../services/authService";

interface ResetPasswordPageProps {
  onGoToLogin?: () => void;
}

export function ResetPasswordPage({ onGoToLogin }: ResetPasswordPageProps) {
  const token = new URLSearchParams(window.location.search).get("token");

  const [tokenValid,      setTokenValid]      = useState<boolean | null>(null);
  const [tokenError,      setTokenError]      = useState<string | null>(null);
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [success,         setSuccess]         = useState(false);
  const [pwError,         setPwError]         = useState<string | null>(null);
  const [confirmError,    setConfirmError]    = useState<string | null>(null);

  const goToLogin = () => {
    if (onGoToLogin) {
      onGoToLogin();
    } else {
      window.location.href = "/";
    }
  };

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setTokenError("El enlace no contiene un token válido.");
      return;
    }
    validateResetTokenRequest(token)
      .then(() => setTokenValid(true))
      .catch((err: any) => {
        setTokenValid(false);
        setTokenError(err.message || "El enlace ha expirado o no es válido.");
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!password) {
      setPwError("La contraseña es requerida"); valid = false;
    } else if (password.length < 6) {
      setPwError("Mínimo 6 caracteres"); valid = false;
    } else { setPwError(null); }

    if (!confirmPassword) {
      setConfirmError("Confirma tu contraseña"); valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError("Las contraseñas no coinciden"); valid = false;
    } else { setConfirmError(null); }

    if (!valid) return;

    setLoading(true);
    try {
      await resetPasswordRequest(token!, password);
      setSuccess(true);
      toast.success("Contraseña actualizada correctamente");
      setTimeout(goToLogin, 2500);
    } catch (err: any) {
      toast.error(err.message || "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  // ── Cargando ─────────────────────────────────────────────────
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f0e8" }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#1a3a2a" }} />
          <p className="text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>Verificando enlace...</p>
        </div>
      </div>
    );
  }

  // ── Token inválido ───────────────────────────────────────────
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f5f0e8" }}>
        <Card className="w-full max-w-[400px] shadow-lg border" style={{ backgroundColor: "#ffffff", borderColor: "#ede8e0", borderRadius: 16 }}>
          <CardHeader className="text-center pt-8 pb-4">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "#fee2e2" }}>
                <AlertCircle className="w-7 h-7" style={{ color: "#e53e3e" }} />
              </div>
            </div>
            <CardTitle className="text-xl font-normal" style={{ color: "#1a3a2a", fontFamily: "var(--font-display)" }}>
              Enlace inválido
            </CardTitle>
            <CardDescription className="text-xs" style={{ color: "#6b7c6b" }}>
              {tokenError}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 space-y-3">
            <p className="text-xs text-center" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
              Solicita un nuevo enlace desde la pantalla de inicio de sesión.
            </p>
            <Button onClick={goToLogin} className="w-full h-10 rounded-lg"
              style={{ backgroundColor: "#1a3a2a", color: "#ffffff", fontWeight: 600 }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Éxito ────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f5f0e8" }}>
        <Card className="w-full max-w-[400px] shadow-lg border" style={{ backgroundColor: "#ffffff", borderColor: "#ede8e0", borderRadius: 16 }}>
          <CardHeader className="text-center pt-8 pb-4">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "#e8f7f4" }}>
                <CheckCircle className="w-7 h-7" style={{ color: "#1a5c3a" }} />
              </div>
            </div>
            <CardTitle className="text-xl font-normal" style={{ color: "#1a3a2a", fontFamily: "var(--font-display)" }}>
              ¡Contraseña actualizada!
            </CardTitle>
            <CardDescription className="text-xs" style={{ color: "#6b7c6b" }}>
              Serás redirigido al inicio en unos segundos...
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <Button onClick={goToLogin} className="w-full h-10 rounded-lg"
              style={{ backgroundColor: "#1a3a2a", color: "#ffffff", fontWeight: 600 }}>
              Ir al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Formulario ───────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f5f0e8", fontFamily: "var(--font-display)" }}>
      {/* Top bar */}
      <div className="flex items-start justify-end px-10 pt-8">
        <div className="tracking-[0.25em] text-xs" style={{ color: "#1a3a2a" }}>HIGHLIFE SPA</div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-[420px] shadow-lg border"
          style={{ backgroundColor: "#ffffff", borderColor: "#ede8e0", borderRadius: 16 }}>

          <CardHeader className="text-center pb-4 pt-8">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "#e8f7f4" }}>
                <KeyRound className="w-7 h-7" style={{ color: "#1a5c3a" }} />
              </div>
            </div>
            <CardTitle className="text-2xl font-normal" style={{ color: "#1a3a2a", fontFamily: "var(--font-display)" }}>
              Nueva contraseña
            </CardTitle>
            <CardDescription className="text-xs" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
              Ingresa y confirma tu nueva contraseña
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-4" style={{ fontFamily: "var(--font-body)" }}>

              {/* Nueva contraseña */}
              <div className="space-y-1.5">
                <Label className="text-[10px] tracking-[0.18em]" style={{ color: "#6b7c6b" }}>
                  NUEVA CONTRASEÑA
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPwError(null); }}
                    placeholder="Mínimo 6 caracteres"
                    className="h-10 rounded-lg border-0 pr-10 text-sm"
                    style={{ backgroundColor: "#ece7df", color: "#1a3a2a", ...(pwError ? { outline: "1.5px solid #e53e3e" } : {}) }}
                    disabled={loading}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#6b7c6b" }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwError && <p className="text-[10px]" style={{ color: "#e53e3e" }}>{pwError}</p>}
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-1.5">
                <Label className="text-[10px] tracking-[0.18em]" style={{ color: "#6b7c6b" }}>
                  CONFIRMAR CONTRASEÑA
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError(null); }}
                    placeholder="Repite tu contraseña"
                    className="h-10 rounded-lg border-0 pr-10 text-sm"
                    style={{ backgroundColor: "#ece7df", color: "#1a3a2a", ...(confirmError ? { outline: "1.5px solid #e53e3e" } : {}) }}
                    disabled={loading}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#6b7c6b" }}>
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmError && <p className="text-[10px]" style={{ color: "#e53e3e" }}>{confirmError}</p>}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg mt-2"
                style={{ backgroundColor: "#1a3a2a", color: "#ffffff", fontWeight: 600 }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a5a40")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </span>
                ) : "Cambiar contraseña"}
              </Button>

              <div className="pt-2 text-center">
                <button type="button" onClick={goToLogin}
                  className="text-xs underline-offset-4 hover:underline flex items-center justify-center gap-1 mx-auto"
                  style={{ color: "#6b7c6b" }}>
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Volver al inicio
                </button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
