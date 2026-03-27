// src/features/users/services/usersService.ts
import { API_URL } from "../constants";
import { User, Role } from "../types";

const getToken   = () => localStorage.getItem("token");
const authHeader = () => ({
  Authorization:  `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

export async function fetchUsersApi(): Promise<User[]> {
  const res = await fetch(`${API_URL}/api/users`, { headers: authHeader() }); // ← /api/users
  if (!res.ok) throw new Error("Error al cargar usuarios");
  return res.json();
}

export async function fetchRolesApi(): Promise<Role[]> {
  const res = await fetch(`${API_URL}/api/users/roles`, { headers: authHeader() }); // ← /api/users/roles + token
  if (!res.ok) throw new Error("Error al cargar roles");
  return res.json();
}

export async function createUserApi(body: any): Promise<void> {
  const res = await fetch(`${API_URL}/api/users`, {
    method:  "POST",
    headers: authHeader(),
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al crear usuario");
  }
}

export async function updateUserApi(id: number, body: any): Promise<void> {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method:  "PUT",
    headers: authHeader(),
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al actualizar usuario");
  }
}

export async function toggleUserStatusApi(id: number, isActive: boolean): Promise<void> {
  const res = await fetch(`${API_URL}/api/users/${id}/status`, { // ← /status no /estado
    method:  "PATCH",
    headers: authHeader(),
    body:    JSON.stringify({ isActive }),
  });
  if (!res.ok) throw new Error("Error al actualizar estado");
}

export async function deleteUserApi(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method:  "DELETE",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Error al eliminar usuario");
}