import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "../../../firebase";
import { googleLoginRequest } from "../services/authService";
import { getGoogleProfileFromFirebaseUser } from "./googleProfile";

export async function signInWithGoogleBackend() {
  console.log("🔵 [Google Auth] Iniciando autenticación con Google...");
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("✅ [Google Auth] Popup completado exitosamente");
    console.log("📧 [Google Auth] Email:", result.user.email);
    
    const credential = GoogleAuthProvider.credentialFromResult(result);
    console.log("🔑 [Google Auth] Credential obtenido:", credential ? "Sí" : "No");
    
    const idToken = credential?.idToken;
    if (!idToken) {
      console.error("❌ [Google Auth] No se pudo obtener el idToken");
      throw new Error("No se pudo obtener el token de Google. Intenta de nuevo.");
    }
    
    console.log("✅ [Google Auth] idToken obtenido correctamente");
    
    const profile = getGoogleProfileFromFirebaseUser(result.user);
    console.log("👤 [Google Auth] Perfil extraído:", profile);
    
    console.log("📤 [Google Auth] Enviando datos al backend...");
    const data = await googleLoginRequest(idToken, profile);
    console.log("✅ [Google Auth] Respuesta del backend recibida");
    
    return data;
  } catch (error: any) {
    console.error("❌ [Google Auth] Error:", error);
    console.error("❌ [Google Auth] Error code:", error.code);
    console.error("❌ [Google Auth] Error message:", error.message);
    throw error;
  }
}
