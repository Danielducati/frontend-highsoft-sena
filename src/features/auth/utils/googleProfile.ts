import type { User } from "firebase/auth";

export type GoogleProfilePayload = {
  nombre?: string;
  apellido?: string;
  foto?: string;
  displayName?: string;
};

export function getGoogleProfileFromFirebaseUser(user: User): GoogleProfilePayload {
  const displayName = user.displayName?.trim() ?? "";
  const parts = displayName.split(/\s+/).filter(Boolean);
  return {
    nombre: parts[0] ?? "",
    apellido: parts.slice(1).join(" "),
    foto: user.photoURL ?? "",
    displayName,
  };
}
