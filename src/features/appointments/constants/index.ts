export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export const TIME_SLOTS = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30",
  "14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00","18:30",
];

export const WEEK_DAYS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

export const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

export const STATUS_LABELS: Record<string, string> = {
  pending:   "Pendiente",
  cancelled: "Cancelada",
  completed: "Completada",
};

export const STATUS_BG: Record<string, string> = {
  pending:   " #F59E0B20",
  cancelled: " #EF444420",
  completed: " #3B82F620",
};

export const STATUS_BORDER: Record<string, string> = {
  pending:   " #F59E0B",
  cancelled: " #EF4444",
  completed: " #3B82F6",
};

export const LEGEND_ITEMS = [
  { color: " #F59E0B", label: "Pendiente"  },
  { color: "rgb(0, 125, 241)", label: "Completada" },
  { color: " #EF4444", label: "Cancelada"  },
];