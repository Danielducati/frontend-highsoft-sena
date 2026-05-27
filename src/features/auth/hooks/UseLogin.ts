import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../types";
import { loginRequest, forgotPasswordRequest, completeAuthSession } from "../services/authService";
import { getGoogleAuthErrorMessage } from "../utils/googleAuthError";
import { signInWithGoogleBackend } from "../utils/googleSignIn";

export function useLogin(onLogin: (role: UserRole) => void) {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [recoveryEmail,      setRecoveryEmail]      = useState("");
  const [recoverySuccess,    setRecoverySuccess]    = useState(false);
  const [recoveryLoading,    setRecoveryLoading]    = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor ingresa tu correo y contraseña");
      return;
    }

    setLoading(true);
    try {
      const data = await loginRequest(email, password);
      const { rolFrontend, rolBackend, firstPage } = await completeAuthSession(data);
      toast.success(`¡Bienvenido! Accediendo como ${rolBackend}`);
      onLogin(rolFrontend, firstPage);
    } catch (err: any) {
      console.error("❌ ERROR LOGIN:", err);
      toast.error(err.message ?? "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recoveryEmail) {
      toast.error("Por favor ingresa tu correo electrónico");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recoveryEmail)) {
      toast.error("Por favor ingresa un correo electrónico válido");
      return;
    }

    setRecoveryLoading(true);
    try {
      await forgotPasswordRequest(recoveryEmail);
      setRecoverySuccess(true);
      toast.success("Enlace de recuperación enviado a tu correo");
    } catch (err: any) {
      toast.error(err.message ?? "No se pudo enviar el correo");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleCloseRecoveryDialog = () => {
    setForgotPasswordOpen(false);
    setRecoveryEmail("");
    setRecoverySuccess(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const data = await signInWithGoogleBackend();
      const { rolFrontend, rolBackend, firstPage } = await completeAuthSession(data);
      toast.success(`¡Bienvenido! Accediendo como ${rolBackend}`);
      onLogin(rolFrontend, firstPage);
    } catch (err: unknown) {
      toast.error(getGoogleAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    loading,
    forgotPasswordOpen, setForgotPasswordOpen,
    recoveryEmail, setRecoveryEmail,
    recoverySuccess,
    recoveryLoading,
    handleLogin,
    handleGoogleLogin,
    handleForgotPassword,
    handleCloseRecoveryDialog,
  };
}
