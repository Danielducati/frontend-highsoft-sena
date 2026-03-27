import { API_BASE } from "../constants";
import { DashboardData } from "../types";

export async function fetchDashboardApi(period: string): Promise<DashboardData> {
  const res = await fetch(`${API_BASE}/dashboard?period=${encodeURIComponent(period)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof (data as { error?: string }).error === "string"
      ? (data as { error: string }).error
      : "Error al cargar el dashboard";
    throw new Error(msg);
  }
  return data as DashboardData;
}