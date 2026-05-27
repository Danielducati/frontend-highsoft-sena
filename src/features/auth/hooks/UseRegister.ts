import { useState } from "react";
import { toast } from "sonner";
import { signInWithPopup } from "firebase/auth";
import { RegisterFormData } from "../types";
import { registerRequest, googleLoginRequest } from "../services/authService";
import { auth, googleProvider } from "../../../firebase";

const EMPTY_FORM: RegisterFormData = {
  fullName: "", apellido: "", email: "", phone: "",
  tipocedula: "", cedula: "", password: "", confirmPassword: "",
};

export type RegisterErrors = Partial<Record<keyof RegisterFormData, string>>;

export function useRegister(onRegisterSuccess: () => void) {
  const [formData,     setFormData]     = useState<RegisterFormData>(EMPTY_FORM);
  const [errors,       setErrors]       = useState<RegisterErrors>({});
  const [showSuccess,  setShowSuccess]  = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);

  const handleChange = (field: keyof RegisterFormData, value: string) => {
    let sanitized = value;

    // Solo letras en nombre y apellido
    if (field === "fullName" || field === "apellido") {
      sanitized = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, "");
    }
    // Solo números en teléfono y documento
    if (field === "phone" || field === "cedula") {
      sanitized = value.replace(/\D/g, "");
    }

    setFormData(prev => ({ ...prev, [field]: sanitized }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const { fullName, apellido, email, phone, tipocedula, cedula, password, confirmPassword } = formData;
    const e: RegisterErrors = {};

    if (!fullName.trim())        e.fullName       = "El nombre es requerido";
    if (!apellido.trim())        e.apellido       = "El apellido es requerido";
    if (!email.trim())           e.email          = "El correo es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                                 e.email          = "Ingresa un correo válido";
    if (!phone.trim())           e.phone          = "El teléfono es requerido";
    if (!tipocedula)             e.tipocedula     = "Selecciona el tipo de documento";
    if (!cedula.trim())               e.cedula = "El número de documento es requerido";
    else if (cedula.trim().length < 6)  e.cedula = "El número de documento debe tener mínimo 6 dígitos";
    else if (cedula.trim().length > 15) e.cedula = "El número de documento no puede tener más de 15 dígitos";
    if (!password)               e.password       = "La contraseña es requerida";
    else if (password.length < 6) e.password      = "Mínimo 6 caracteres";
    if (!confirmPassword)        e.confirmPassword = "Confirma tu contraseña";
    else if (password !== confirmPassword)
                                 e.confirmPassword = "Las contraseñas no coinciden";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const { fullName, apellido, email, phone, tipocedula, cedula, password } = formData;

    setLoading(true);
    try {
      await registerRequest({ email, password, fullName, apellido, phone, tipocedula, cedula });
      setShowSuccess(true);
      toast.success("¡Registro exitoso!");
      setTimeout(() => onRegisterSuccess(), 2500);
    } catch (err: any) {
      toast.error(err.message ?? "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await googleLoginRequest(idToken);
      setShowSuccess(true);
      toast.success("¡Registro con Google exitoso!");
      setTimeout(() => onRegisterSuccess(), 2500);
    } catch (err: any) {
      const message = err?.code === "auth/popup-closed-by-user"
        ? "Se cerró la ventana de Google"
        : err?.code === "auth/configuration-not-found"
          ? "Google Auth no está habilitado en Firebase. Activa Google en Authentication > Sign-in method y verifica el dominio autorizado (localhost)."
          : (err?.message ?? "No se pudo registrar con Google");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData, handleChange,
    errors,
    showSuccess, showPassword, setShowPassword,
    loading, handleSubmit, handleGoogleRegister,
  };
}
