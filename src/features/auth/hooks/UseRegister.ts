import { useState } from "react";
import { toast } from "sonner";
import { RegisterFormData } from "../types";
import { registerRequest } from "../services/authService";

const EMPTY_FORM: RegisterFormData = {
  fullName: "", apellido: "", email: "", phone: "",
  tipocedula: "", cedula: "", password: "", confirmPassword: "",
};

export function useRegister(onRegisterSuccess: () => void) {
  const [formData,     setFormData]     = useState<RegisterFormData>(EMPTY_FORM);
  const [showSuccess,  setShowSuccess]  = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { fullName, apellido, email, phone, tipocedula, cedula, password, confirmPassword } = formData;

    // Validaciones
    if (!fullName || !apellido || !email || !password || !confirmPassword) {
      toast.error("Por favor completa: nombre, apellido, correo y contraseña");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor ingresa un correo electrónico válido");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      console.log("📝 Datos del formulario:", { fullName, apellido, email, phone, tipocedula, cedula, password });
      
      // ✅ ENVIANDO CON LOS NOMBRES CORRECTOS QUE ESPERA EL BACKEND
      await registerRequest({
        email: email,
        password: password,
        fullName: fullName,
        apellido: apellido,
        phone: phone,
        tipocedula: tipocedula,
        cedula: cedula,
      });

      setShowSuccess(true);
      toast.success("¡Registro exitoso!");
      setTimeout(() => onRegisterSuccess(), 2500);
    } catch (err: any) {
      console.error("❌ Error en registro:", err);
      toast.error(err.message ?? "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData, handleChange,
    showSuccess, showPassword, setShowPassword,
    loading, handleSubmit,
  };
} 