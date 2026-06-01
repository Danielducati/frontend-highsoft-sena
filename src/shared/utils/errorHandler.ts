/**
 * Maneja errores de fetch y devuelve mensajes amigables para el usuario
 */
export function handleFetchError(error: any): string {
  // Error de red (sin conexión, timeout, etc.)
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
  }
  
  if (error.message === 'Failed to fetch') {
    return 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
  }
  
  // Error de timeout
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return 'La solicitud tardó demasiado. Verifica tu conexión a internet e intenta nuevamente.';
  }
  
  // Error de red genérico
  if (error.message.includes('NetworkError') || error.message.includes('Network request failed')) {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }
  
  // Si el error tiene un mensaje personalizado del servidor, usarlo
  if (error.error && typeof error.error === 'string') {
    return error.error;
  }
  
  if (error.message && typeof error.message === 'string' && !error.message.includes('fetch')) {
    return error.message;
  }
  
  // Error genérico
  return 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
}

/**
 * Wrapper para fetch que maneja errores de red automáticamente
 */
export async function fetchWithErrorHandling(
  url: string,
  options?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // Si la respuesta no es OK, intentar extraer el mensaje de error del servidor
    if (!response.ok) {
      let errorMessage = `Error ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON, usar el status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    return response;
  } catch (error: any) {
    // Si es un error de red, lanzar un error con mensaje amigable
    if (error instanceof TypeError || error.message === 'Failed to fetch') {
      throw new Error('No se pudo conectar al servidor. Verifica tu conexión a internet.');
    }
    
    // Re-lanzar el error original si ya tiene un mensaje personalizado
    throw error;
  }
}

/**
 * Valida campos comunes y devuelve mensajes específicos
 */
export const validators = {
  email: (email: string): string | null => {
    if (!email.trim()) return 'El correo electrónico es obligatorio';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Ingresa un correo electrónico válido (ejemplo: usuario@dominio.com)';
    return null;
  },
  
  phone: (phone: string): string | null => {
    if (!phone.trim()) return null; // Opcional
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) return 'El teléfono debe tener exactamente 10 dígitos';
    return null;
  },
  
  password: (password: string, minLength: number = 6): string | null => {
    if (!password) return 'La contraseña es obligatoria';
    if (password.length < minLength) return `La contraseña debe tener al menos ${minLength} caracteres`;
    return null;
  },
  
  required: (value: string, fieldName: string): string | null => {
    if (!value || !value.trim()) return `${fieldName} es obligatorio`;
    return null;
  },
  
  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (value.length < min) return `${fieldName} debe tener al menos ${min} caracteres`;
    return null;
  },
  
  maxLength: (value: string, max: number, fieldName: string): string | null => {
    if (value.length > max) return `${fieldName} no puede tener más de ${max} caracteres`;
    return null;
  },
  
  number: (value: string, fieldName: string): string | null => {
    if (isNaN(Number(value))) return `${fieldName} debe ser un número válido`;
    return null;
  },
  
  positiveNumber: (value: number, fieldName: string): string | null => {
    if (value <= 0) return `${fieldName} debe ser mayor a 0`;
    return null;
  },
};
