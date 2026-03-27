import React, { useState, useEffect } from "react";

// Landing & Auth
import { LandingPage }    from "../features/landing/LandingPage";
import { LoginPage }      from "../features/auth/pages/LoginPage";
import { RegisterPage }   from "../features/auth//pages/RegisterPage";

// Layout
import { Sidebar } from "../shared/components/layout/Sidebar";
import { Header }  from "../shared/components/layout/Header";

// Modules
import { Dashboard }         from "../features/dashboard/DashboardModule";
import { ServicesModule }    from "../features/services/ServicesModule";
import { CategoriesModule }  from "../features/categories/CategoriesModule";
import { NewsModule }        from "../features/news/NewsModule";
import { AppointmentsModule } from "../features/appointments/AppointmentsModule";
import { SchedulesModule }   from "../features/schedules/SchedulesModule";
import { QuotationsModule }  from "../features/quotations/QuotationsModule";
import { SalesModule }       from "../features/sales/SalesModule";
import { ClientsModule }     from "../features/clients/ClientsModule";
import { EmployeesModule }   from "../features/employees/EmployeesModule";
import { UsersModule }       from "../features/users/UsersModule";
import { RolesModule }       from "../features/roles/RolesModule";
import { SettingsModule }    from "../features/settings/SettingsModule";

import { Toaster } from "sonner";

type UserRole = "admin" | "employee" | "client" | null;
type Page =
  | "landing" | "login" | "register"
  | "dashboard" | "services" | "categories" | "news"
  | "appointments" | "schedules" | "quotations" | "sales"
  | "clients" | "employees" | "users" | "roles" | "settings";

// Páginas que cada rol puede ver
const ALLOWED_PAGES: Record<string, Page[]> = {
  admin:    [
    "dashboard", "services", "categories", "news", "appointments",
    "schedules", "quotations", "sales", "clients", "employees",
    "users", "roles", "settings",
  ],
  employee: ["appointments", "news", "schedules", "clients", "sales"],
  client:   ["appointments", "users"],
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [userRole,    setUserRole]    = useState<UserRole>(null);

  const handleLogin = (role: "admin" | "employee" | "client") => {
    setUserRole(role);
    setCurrentPage(role === "client" || role === "employee" ? "appointments" : "dashboard");
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentPage("landing");
  };

  const handleNavigate = (page: string) => {
    if (page === "login" || page === "register") {
      setCurrentPage(page as Page);
      return;
    }
    if (!userRole) return;
    // Solo navega si el rol tiene permiso
    const allowed = ALLOWED_PAGES[userRole] ?? [];
    if (allowed.includes(page as Page)) {
      setCurrentPage(page as Page);
    }
  };

  if (currentPage === "landing") return (
    <><LandingPage onNavigate={handleNavigate} /><Toaster /></>
  );

  if (currentPage === "login") return (
    <><LoginPage onLogin={handleLogin} onBack={() => setCurrentPage("landing")} /><Toaster /></>
  );

  if (currentPage === "register") return (
    <><RegisterPage onBack={() => setCurrentPage("landing")} onRegisterSuccess={() => setCurrentPage("landing")} /><Toaster /></>
  );

  if (!userRole) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activePage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} userRole={userRole} />

      <div className="flex-1 flex flex-col ml-64" style={{ backgroundColor: "#f5f0e8" }}>
        <Header userRole={userRole} />

        <main className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: "#f5f0e8" }}>

          {/* ── Solo admin ───────────────────────────────────────── */}
          {currentPage === "dashboard"  && userRole === "admin" && <Dashboard />}
          {currentPage === "categories" && userRole === "admin" && <CategoriesModule userRole={userRole} />}
          {currentPage === "schedules"  && userRole === "admin" && <SchedulesModule  userRole={userRole} />}
          {currentPage === "quotations" && userRole === "admin" && <QuotationsModule userRole={userRole} />}
          {currentPage === "employees"  && userRole === "admin" && <EmployeesModule  userRole={userRole} />}
          {currentPage === "roles"      && userRole === "admin" && <RolesModule      userRole={userRole} />}
          {currentPage === "settings"   && userRole === "admin" && <SettingsModule   userRole={userRole} />}

          {/* ── Admin + employee ─────────────────────────────────── */}
          {currentPage === "news"    && (userRole === "admin" || userRole === "employee") && <NewsModule     userRole={userRole} />}
          {currentPage === "sales"   && (userRole === "admin" || userRole === "employee") && <SalesModule    userRole={userRole} />}
          {currentPage === "clients" && (userRole === "admin" || userRole === "employee") && <ClientsModule  userRole={userRole} />}
          {currentPage === "services" && (userRole === "admin" || userRole === "employee") && <ServicesModule userRole={userRole} />}

          {/* ── Todos los roles ──────────────────────────────────── */}
          {currentPage === "appointments" && <AppointmentsModule userRole={userRole} />}
          {currentPage === "users"        && <UsersModule        userRole={userRole} />}

        </main>
      </div>

      <Toaster />
    </div>
  );
}