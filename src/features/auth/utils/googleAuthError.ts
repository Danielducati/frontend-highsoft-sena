export function getGoogleAuthErrorMessage(err: unknown): string {
  const e = err as { code?: string; message?: string };
  if (e?.code === "auth/popup-closed-by-user") {
    return "Se cerró la ventana de Google";
  }
  if (e?.code === "auth/configuration-not-found") {
    return "Google Auth no está habilitado en Firebase. Activa Google en Authentication > Sign-in method.";
  }
  return e?.message ?? "No se pudo conectar con Google";
}
