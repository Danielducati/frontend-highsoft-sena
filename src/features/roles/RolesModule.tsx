import { RolesPage } from "./pages/RolesPage";

interface RolesModuleProps {
  userRole: "admin" | "employee" | "client";
}

export function RolesModule({ userRole }: RolesModuleProps) {
  return <RolesPage userRole={userRole} />;
}