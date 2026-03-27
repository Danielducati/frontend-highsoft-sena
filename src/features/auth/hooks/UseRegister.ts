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

    if (!fullName || !apellido || !email || !phone || !tipocedula || !cedula || !password || !confirmPassword) {
      toast.error("Por favor completa todos los campos");
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
      await registerRequest({
        correo:           email,
        contrasena:       password,
        nombre:           fullName,
        apellido,
        telefono:         phone,
        tipo_documento:   tipocedula,
        numero_documento: cedula,
      });
      setShowSuccess(true);
      setTimeout(() => onRegisterSuccess(), 2500);
    } catch (err: any) {
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