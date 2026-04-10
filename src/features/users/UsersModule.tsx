import { UsersPage } from "./pages/UsersPage";
import { EmployeeProfilePage } from "./pages/EmployeeProfilePage";
import { ClientProfilePage } from "./pages/ClientProfilePage";

interface UsersModuleProps {
  userRole: "admin" | "employee" | "client";
}

export function UsersModule({ userRole }: UsersModuleProps) {
  if (userRole === "employee") return <EmployeeProfilePage />;
  if (userRole === "client")   return <ClientProfilePage />;
  return <UsersPage userRole={userRole} />;
}
