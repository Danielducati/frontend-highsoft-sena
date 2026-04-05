// src/features/dashboard/constants/index.ts
export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export const COLORS = ["#78D1BD", "#A78BFA", "#60A5FA", "#FBBF24", "#F87171"];

export const PERIOD_OPTIONS = [
  { value: "7days",  label: "Últimos 7 días"  },
  { value: "30days", label: "Últimos 30 días" },
  { value: "90days", label: "Últimos 90 días" },
  { value: "year",   label: "Este año"        },
];