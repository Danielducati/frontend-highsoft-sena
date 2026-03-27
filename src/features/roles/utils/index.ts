import { Permission } from "../types";

export function groupPermissionsByCategory(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce((acc, p) => {
    const category = p.category ?? "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);
}