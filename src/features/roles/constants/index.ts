export const API = "http://localhost:3001";

export const getToken = () => localStorage.getItem("token") ?? "";

export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export function parseCategory(nombre: string): string {
  const cat = nombre.split(".")[0];
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

export function parseName(nombre: string): string {
  const parts  = nombre.split(".");
  const accion = parts[1] ?? parts[0];
  const map: Record<string, string> = {
    ver: "Ver", crear: "Crear", editar: "Editar", eliminar: "Eliminar",
  };
  return map[accion] ?? accion;
}