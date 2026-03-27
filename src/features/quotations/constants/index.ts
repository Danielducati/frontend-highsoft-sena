import { QuotationStatus } from "../types";

export const API_URL = "http://localhost:3001";
export const ITEMS_PER_PAGE = 10;

export const STATUS_COLORS: Record<QuotationStatus, string> = {
  pending:   "bg-amber-100 text-amber-700",
  approved:  "bg-emerald-100 text-emerald-700",
  rejected:  "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
  expired:   "bg-gray-100 text-gray-700",
};

export const STATUS_LABELS: Record<QuotationStatus, string> = {
  pending:   "Pendiente",
  approved:  "Aprobada",
  rejected:  "Rechazada",
  cancelled: "Cancelada",
  expired:   "Expirada",
};

export const STATUS_OPTIONS: { value: QuotationStatus; label: string }[] = [
  { value: "pending",   label: "Pendiente"  },
  { value: "approved",  label: "Aprobada"   },
  { value: "rejected",  label: "Rechazada"  },
  { value: "cancelled", label: "Cancelada"  },
  { value: "expired",   label: "Expirada"   },
];