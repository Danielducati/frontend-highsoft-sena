import { useRef, useCallback } from 'react';

/**
 * Hook para prevenir doble clic en operaciones asíncronas
 * Ignora clics adicionales mientras la operación está en progreso
 */
export function usePreventDoubleClick<T extends (...args: any[]) => Promise<any>>(
  asyncFunction: T,
  delay: number = 1000
): [T, boolean] {
  const isProcessing = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const wrappedFunction = useCallback(
    async (...args: Parameters<T>) => {
      // Si ya está procesando, ignorar el clic
      if (isProcessing.current) {
        console.log('⚠️ Operación en progreso, ignorando clic adicional');
        return;
      }

      // Marcar como procesando
      isProcessing.current = true;

      try {
        // Ejecutar la función original
        const result = await asyncFunction(...args);
        return result;
      } catch (error) {
        // Re-lanzar el error para que el componente lo maneje
        throw error;
      } finally {
        // Liberar después de un delay mínimo para evitar doble clic rápido
        timeoutRef.current = setTimeout(() => {
          isProcessing.current = false;
        }, delay);
      }
    },
    [asyncFunction, delay]
  ) as T;

  // Cleanup del timeout al desmontar
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return [wrappedFunction, isProcessing.current];
}

/**
 * Hook alternativo que deshabilita el botón mientras procesa
 */
export function useAsyncAction<T extends (...args: any[]) => Promise<any>>(
  asyncFunction: T
): [T, boolean] {
  const isLoading = useRef(false);

  const wrappedFunction = useCallback(
    async (...args: Parameters<T>) => {
      if (isLoading.current) {
        return;
      }

      isLoading.current = true;

      try {
        const result = await asyncFunction(...args);
        return result;
      } finally {
        isLoading.current = false;
      }
    },
    [asyncFunction]
  ) as T;

  return [wrappedFunction, isLoading.current];
}
