import { ROLE_BADGE_COLORS } from "../constants";

export function getRoleBadgeColor(role: string): string {
  return ROLE_BADGE_COLORS[role] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

/** Divide "Juan Carlos Pérez López" → ["Juan Carlos", "Pérez López"] */
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(" ");
  const mid   = Math.ceil(parts.length / 2);
  return {
    firstName: parts.slice(0, mid).join(" "),
    lastName:  parts.slice(mid).join(" "),
  };
}