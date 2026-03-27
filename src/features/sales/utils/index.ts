import { SaleItem } from "../types";

export function calcSubtotal(items: SaleItem[]): number {
return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calcTotal(items: SaleItem[], discount: string): number {
return calcSubtotal(items) - (parseFloat(discount) || 0);
}

export function formatDate(dateStr: string): string {
if (!dateStr) return "—";
return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric",
});
}

export function getToken(): string | null {
return localStorage.getItem("token");
}