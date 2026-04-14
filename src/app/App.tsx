import React, { useState, useEffect } from "react";

// Landing & Auth
import { LandingPage }       from "../features/landing/LandingPage";
import { LoginPage }         from "../features/auth/pages/LoginPage";
import { RegisterPage }      from "../features/auth//pages/RegisterPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";

// Layout
import { Sidebar } from "../shared/components/layout/Sidebar";
import { Header }  from "../shared/components/layout/Header";

// Modules
import { Dashboard }         from "../features/dashboard/DashboardModule";
import { ServicesModule }    from "../features/services/ServicesModule";
import { CategoriesModule }  from "../features/categories/CategoriesModule";
import { NewsModule }        from "../features/news/NewsModule";
import { AppointmentsModule } from "../features/appointments/AppointmentsModule";
import { ClientAppointmentsPage } from "../features/appointments/pages/ClientAppointmentsPage";
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
  | "landing" | "login" | "register" | "reset-password"
  | "dashboard" | "services" | "categories" | "news"
  | "appointments" | "schedules" | "quotations" | "sales"
  | "clients" | "employees" | "users" | "roles" | "settings";

// Páginas fijas para roles base (admin siempre ve todo)
const BASE_ALLOWED_PAGES: Record<string, Page[]> = {
  admin:    [
    "dashboard", "services", "categories", "news", "appointments",
    "schedules", "quotations", "sales", "clients", "employees",
    "users", "roles", "settings",
  ],
  client: ["appointments", "users"],
};

function getAllowedPages(userRole: UserRole): Page[] {
  if (!userRole) return [];
  if (userRole === "admin") return BASE_ALLOWED_PAGES.admin;
  // Para employee y client, leer las páginas calculadas al login desde permisos del backend
  try {
    const stored = localStorage.getItem("allowedPages");
    if (stored) {
      const pages = JSON.parse(stored) as Page[];
      if (pages.length > 0) return pages;
    }
  } catch {}
  // Fallback si no hay allowedPages guardado
  if (userRole === "client") return BASE_ALLOWED_PAGES.client;
  return ["users"];
}

function AppContent({ currentPage, userRole }: { currentPage: Page; userRole: NonNullable<UserRole> }) {
  const allowed = getAllowedPages(userRole);
  const can = (page: string) => allowed.includes(page as Page);

  return (
    <>
      {currentPage === "dashboard"    && can("dashboard")    && <Dashboard />}
      {currentPage === "categories"   && can("categories")   && <CategoriesModule  userRole={userRole} />}
      {currentPage === "schedules"    && can("schedules")    && <SchedulesModule   userRole={userRole} />}
      {currentPage === "quotations"   && can("quotations")   && <QuotationsModule  userRole={userRole} />}
      {currentPage === "employees"    && can("employees")    && <EmployeesModule   userRole={userRole} />}
      {currentPage === "roles"        && can("roles")        && <RolesModule       userRole={userRole} />}
      {currentPage === "settings"     && can("settings")     && <SettingsModule    userRole={userRole} />}
      {currentPage === "news"         && can("news")         && <NewsModule        userRole={userRole} />}
      {currentPage === "sales"        && can("sales")        && <SalesModule       userRole={userRole} />}
      {currentPage === "clients"      && can("clients")      && <ClientsModule     userRole={userRole} />}
      {currentPage === "services"     && can("services")     && <ServicesModule    userRole={userRole} />}
      {currentPage === "appointments" && userRole === "client"  && <ClientAppointmentsPage />}
      {currentPage === "appointments" && userRole !== "client"  && can("appointments") && <AppointmentsModule userRole={userRole} />}
      {currentPage === "users"        && <UsersModule userRole={userRole} />}
    </>
  );
}

export default function App() {
  // Si la URL trae ?token=... mostrar reset-password directamente
  const getInitialPage = (): Page => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("token")) return "reset-password";
    return "landing";
  };

  const [currentPage, setCurrentPage] = useState<Page>(getInitialPage);
  const [userRole,    setUserRole]    = useState<UserRole>(null);
  const [userName,    setUserName]    = useState<string>("");
  const [userPhoto,   setUserPhoto]   = useState<string>("");
  // Contador para forzar re-render cuando cambian los permisos
  const [permVersion, setPermVersion] = useState(0);

  // Escuchar actualizaciones de perfil (foto) desde páginas internas
  useEffect(() => {
    const handler = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("usuario") ?? "{}");
        if (stored.foto) setUserPhoto(stored.foto);
        if (stored.nombre || stored.apellido) {
          setUserName(`${stored.nombre ?? ""} ${stored.apellido ?? ""}`.trim() || stored.correo || "");
        }
      } catch { /* silencioso */ }
    };
    window.addEventListener("usuario-updated", handler);
    return () => window.removeEventListener("usuario-updated", handler);
  }, []);

  // Recargar permisos desde el backend cada 60 segundos mientras hay sesión activa
  useEffect(() => {
    if (!userRole || userRole === "admin") return;

    const reload = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const data = await res.json();
        const permisos: string[] = data.permisos ?? [];
        const { resolveAllowedPages } = await import("../features/auth/constants");
        const newPages = resolveAllowedPages(permisos);
        const current  = localStorage.getItem("allowedPages");
        if (JSON.stringify(newPages) !== current) {
          localStorage.setItem("allowedPages", JSON.stringify(newPages));
          localStorage.setItem("permisos",     JSON.stringify(permisos));
          setPermVersion(v => v + 1); // fuerza re-render
        }
      } catch {}
    };

    reload(); // inmediato al montar
    const interval = setInterval(reload, 60_000);
    return () => clearInterval(interval);
  }, [userRole]);

  const handleLogin = (role: "admin" | "employee" | "client", firstPage?: string) => {
    const stored = localStorage.getItem("usuario");
    if (stored) {
      const u = JSON.parse(stored);
      setUserName(`${u.nombre ?? ""} ${u.apellido ?? ""}`.trim() || u.correo || "");
      setUserPhoto(u.foto ?? "");
    }
    setUserRole(role);
    if (role === "admin") {
      setCurrentPage("dashboard");
    } else if (role === "client") {
      setCurrentPage("appointments");
    } else {
      setCurrentPage((firstPage ?? "users") as Page);
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserName("");
    setUserPhoto("");
    localStorage.removeItem("allowedPages");
    localStorage.removeItem("permisos");
    setCurrentPage("landing");
  };

  const handleNavigate = (page: string) => {
    if (page === "login" || page === "register" || page === "reset-password") {
      setCurrentPage(page as Page);
      return;
    }
    if (!userRole) return;
    const allowed = getAllowedPages(userRole);
    if (allowed.includes(page as Page)) {
      setCurrentPage(page as Page);
    }
  };

  if (currentPage === "landing") return (
    <><LandingPage onNavigate={handleNavigate} /><Toaster /></>
  );

  if (currentPage === "login") return (
    <><LoginPage onLogin={handleLogin} onBack={() => setCurrentPage("landing")} onRegister={() => setCurrentPage("register")} /><Toaster /></>
  );

  if (currentPage === "register") return (
    <><RegisterPage onBack={() => setCurrentPage("login")} onRegisterSuccess={() => setCurrentPage("login")} /><Toaster /></>
  );

  if (currentPage === "reset-password") return (
    <><ResetPasswordPage onGoToLogin={() => setCurrentPage("login")} /><Toaster /></>
  );

  if (!userRole) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar key={permVersion} activePage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} userRole={userRole} allowedPages={getAllowedPages(userRole)} />

      <div className="flex-1 flex flex-col ml-64" style={{ backgroundColor: "var(--bg-app)" }}>
        <Header userRole={userRole} userName={userName} userPhoto={userPhoto} onLogout={handleLogout} />

        <main className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: "var(--bg-app)" }}>
          <AppContent currentPage={currentPage} userRole={userRole} />
        </main>
      </div>

      <Toaster />
    </div>
  );
}