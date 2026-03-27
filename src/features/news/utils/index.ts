import { NEWS_TYPES } from "../constants";

export function getTypeConfig(type: string) {
return NEWS_TYPES.find(t => t.value === type) ?? NEWS_TYPES[5];
}

export function getTypeColor(type: string): string {
const map: Record<string, string> = {
    incapacidad: "bg-red-100 text-red-700 border-red-200",
    retraso:     "bg-yellow-100 text-yellow-700 border-yellow-200",
    permiso:     "bg-blue-100 text-blue-700 border-blue-200",
    percance:    "bg-orange-100 text-orange-700 border-orange-200",
    ausencia:    "bg-purple-100 text-purple-700 border-purple-200",
    otro:        "bg-gray-100 text-gray-700 border-gray-200",
};
return map[type] ?? map.otro;
}

export function getStatusColor(status: string): string {
const map: Record<string, string> = {
    pendiente: "bg-amber-100 text-amber-700",
    aprobada:  "bg-emerald-100 text-emerald-700",
    rechazada: "bg-red-100 text-red-700",
    resuelta:  "bg-blue-100 text-blue-700",
};
return map[status] ?? map.pendiente;
}

export function getStatusLabel(status: string): string {
const map: Record<string, string> = {
    pendiente: "Pendiente",
    aprobada:  "Aprobada",
    rechazada: "Rechazada",
    resuelta:  "Resuelta",
};
return map[status] ?? status;
}

export function formatDate(dateStr: string): string {
if (!dateStr) return "-";
const [y, m, d] = dateStr.split("-").map(Number);
return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", year: "numeric",
});
}