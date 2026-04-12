import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Eye, EyeOff, HelpCircle, Loader2} from "lucide-react";
import { ForgotPasswordDialog } from "../components/Forgotpassworddialog";
import { LoginPageProps } from "../types";
import { useLogin } from "../hooks/UseLogin";



export function LoginPage({ onLogin, onBack, onRegister }: LoginPageProps) {
  const {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    loading,
    forgotPasswordOpen, setForgotPasswordOpen,
    recoveryEmail, setRecoveryEmail,
    recoverySuccess,
    recoveryLoading,
    handleLogin,
    handleForgotPassword,
    handleCloseRecoveryDialog,
  } = useLogin(onLogin);

  return (
    <div
      className="min-h-screen relative"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* Imagen de fondo */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(15, 35, 20, 0.62)" }} />

      {/* Contenido */}
      <div className="relative z-10 min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-start justify-end px-10 pt-8">
        <button
          type="button"
          className="w-8 h-8 inline-flex items-center justify-center rounded-full"
          style={{ color: "rgba(255,255,255,0.7)" }}
          aria-label="Ayuda"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Center card */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <Card
          className="border shadow-2xl"
          style={{
            width: "100%",
            maxWidth: 420,
            backgroundColor: "rgba(255,255,255,0.97)",
            borderColor: "rgba(255,255,255,0.2)",
            borderRadius: 20,
          }}
        >
          <CardHeader className="text-center pb-2">
            <CardTitle
              className="text-2xl font-normal"
              style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}
            >
              Bienvenido a
              <br />
              High Life Spa
            </CardTitle>
            <CardDescription
              className="text-xs"
              style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}
            >
              Inicia sesión para administrar la experiencia
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 pb-8">
            <form onSubmit={handleLogin} className="space-y-4" style={{ fontFamily: "var(--font-body)" }}>
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-[10px] tracking-[0.18em]"
                  style={{ color: "#6b7c6b" }}
                >
                  CORREO
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@highlifespa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-10 rounded-lg border-0"
                  style={{ backgroundColor: "#ece7df", color: "#1a3a2a" }}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-[10px] tracking-[0.18em]"
                    style={{ color: "#6b7c6b" }}
                  >
                    CONTRASEÑA
                  </Label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-[11px] underline-offset-4 hover:underline"
                    style={{ color: "#6b7c6b" }}
                    disabled={loading}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="h-10 rounded-lg border-0 pr-10"
                    style={{ backgroundColor: "#ece7df", color: "#1a3a2a" }}
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg"
                style={{
                  backgroundColor: "#1a3a2a",
                  color: "#ffffff",
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a5a40")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>

              <div className="pt-2 text-center space-y-1.5">
                <p className="text-xs" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={onRegister}
                    className="underline-offset-4 hover:underline font-semibold"
                    style={{ color: "#1a3a2a", fontFamily: "var(--font-body)", background: "none", border: "none", cursor: "pointer", fontSize: "inherit" }}
                    disabled={loading}
                  >
                    Regístrate
                  </button>
                </p>
                <button
                  type="button"
                  onClick={onBack}
                  className="text-xs underline-offset-4 hover:underline"
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

      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onClose={handleCloseRecoveryDialog}
        recoveryEmail={recoveryEmail}
        setRecoveryEmail={setRecoveryEmail}
        recoverySuccess={recoverySuccess}
        recoveryLoading={recoveryLoading}
        onSubmit={handleForgotPassword}
      />
      </div>{/* /relative z-10 */}
    </div>
  );
}
