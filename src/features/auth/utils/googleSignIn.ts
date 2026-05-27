import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "../../../firebase";
import { googleLoginRequest } from "../services/authService";
import { getGoogleProfileFromFirebaseUser } from "./googleProfile";

export async function signInWithGoogleBackend() {
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const idToken = credential?.idToken;
  if (!idToken) {
    throw new Error("No se pudo obtener el token de Google. Intenta de nuevo.");
  }
  const profile = getGoogleProfileFromFirebaseUser(result.user);
  const data = await googleLoginRequest(idToken, profile);
  return data;
}
