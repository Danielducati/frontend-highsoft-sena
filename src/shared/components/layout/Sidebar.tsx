import { useState } from "react";
import {
  LayoutDashboard, Sparkles, Package, FolderOpen, Newspaper,
  Calendar, Clock, FileText, ShoppingCart, Users, Settings,
  LogOut, Shield, UserCog, Briefcase, ChevronDown, ChevronRight,
} from "lucide-react";
import { cn } from "../../ui/utils";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userRole: 'admin' | 'employee' | 'client';
  allowedPages?: string[];
}

// Estructura de grupos con sus hijos
const GROUPS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin"],
    children: [],
  },
  {
    id: "configuracion",
    label: "Configuración",
    icon: Settings,
    roles: ["admin"],
    children: [
      { id: "roles",   label: "Roles y Permisos", icon: Shield,  roles: ["admin"] },
      { id: "users",   label: "Usuarios",          icon: UserCog, roles: ["admin"] },
    ],
  },
  {
    id: "empleados_group",
    label: "Empleados",
    icon: Briefcase,
    roles: ["admin"],
    children: [
      { id: "employees", label: "Empleados",  icon: Briefcase, roles: ["admin"] },
      { id: "schedules", label: "Horarios",   icon: Clock,     roles: ["admin"] },
      { id: "news",      label: "Novedades",  icon: Newspaper, roles: ["admin", "employee"] },
    ],
  },
  {
    id: "servicios_group",
    label: "Servicios",
    icon: Package,
    roles: ["admin"],
    children: [
      { id: "categories", label: "Categorías de servicios", icon: FolderOpen, roles: ["admin"] },
      { id: "services",   label: "Servicios",               icon: Package,    roles: ["admin"] },
    ],
  },
  {
    id: "ventas_group",
    label: "Ventas",
    icon: ShoppingCart,
    roles: ["admin"],
    children: [
      { id: "clients",    label: "Clientes",     icon: Users,       roles: ["admin"] },
      { id: "quotations", label: "Cotizaciones", icon: FileText,    roles: ["admin"] },
      { id: "appointments",label: "Citas",       icon: Calendar,    roles: ["admin", "employee", "client"] },
      { id: "sales",      label: "Ventas",       icon: ShoppingCart,roles: ["admin"] },
    ],
  },
];

// Items sueltos para empleados y clientes (sin grupos)
const FLAT_ITEMS = [
  { id: "appointments", label: "Citas",      icon: Calendar,  roles: ["employee", "client"] },
  { id: "news",         label: "Novedades",  icon: Newspaper, roles: ["employee"] },
  { id: "users",        label: "Mi Perfil",  icon: UserCog,   roles: ["employee", "client"] },
];

export function Sidebar({ activePage, onNavigate, onLogout, userRole, allowedPages }: SidebarProps) {
  // Abrir por defecto el grupo que contiene la página activa
  const findInitialOpen = () => {
    for (const g of GROUPS) {
      if (g.children.some(c => c.id === activePage)) return g.id;
    }
    return null;
  };
  const [openGroup, setOpenGroup] = useState<string | null>(findInitialOpen);

  const toggleGroup = (id: string) =>
    setOpenGroup(prev => (prev === id ? null : id));

  const isAllowed = (roles: string[]) => {
    if (userRole === "admin") return roles.includes("admin");
    return (allowedPages ?? []).includes(roles[0]) || roles.includes(userRole);
  };

  return (
    <aside
      className="w-64 flex flex-col h-screen fixed left-0 top-0"
      style={{ backgroundColor: "var(--bg-app)", borderRight: "1px solid var(--border)" }}
    >
      {/* Logo */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid #ece9e3" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1a3a2a, #2a6a4a)" }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="tracking-tight leading-none" style={{ color: "#1a3a2a", fontFamily: "var(--font-display)" }}>
              Highlife Spa
            </h2>
            <p className="text-xs font-medium mt-1" style={{ color: "#8a948b", fontFamily: "var(--font-body)" }}>
              Management Suite
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
        {userRole === "admin" ? (
          // ── Admin: vista con grupos ──────────────────────────────────
          GROUPS.map(group => {
            if (!isAllowed(group.roles)) return null;

            // Sin hijos → item directo
            if (group.children.length === 0) {
              const Icon = group.icon;
              const isActive = activePage === group.id;
              return (
                <button key={group.id} onClick={() => onNavigate(group.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left"
                  style={isActive
                    ? { backgroundColor: "#0f5b43", color: "#ffffff" }
                    : { color: "#4b5563" }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "#ece9e3"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>{group.label}</span>
                </button>
              );
            }

            // Con hijos → grupo colapsable
            const isOpen    = openGroup === group.id;
            const hasActive = group.children.some(c => c.id === activePage);
            const GroupIcon = group.icon;

            return (
              <div key={group.id}>
                {/* Cabecera del grupo */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left"
                  style={{
                    color: hasActive ? "#1a3a2a" : "#4b5563",
                    fontWeight: hasActive ? 600 : 400,
                    backgroundColor: hasActive && !isOpen ? "#edf7f4" : "transparent",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#ece9e3"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = hasActive && !isOpen ? "#edf7f4" : "transparent"; }}
                >
                  <GroupIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm flex-1" style={{ fontFamily: "var(--font-body)" }}>{group.label}</span>
                  {isOpen
                    ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                </button>

                {/* Hijos */}
                {isOpen && (
                  <div className="ml-3 mt-0.5 space-y-0.5 pl-3"
                    style={{ borderLeft: "2px solid #e5e7eb" }}>
                    {group.children
                      .filter(c => isAllowed(c.roles))
                      .map(child => {
                        const ChildIcon = child.icon;
                        const isActive  = activePage === child.id;
                        return (
                          <button key={child.id} onClick={() => onNavigate(child.id)}
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all text-left"
                            style={isActive
                              ? { backgroundColor: "#0f5b43", color: "#ffffff" }
                              : { color: "#6b7280" }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "#ece9e3"; }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
                          >
                            <ChildIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="text-sm" style={{ fontFamily: "var(--font-body)" }}>{child.label}</span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // ── Empleado / Cliente: items planos ─────────────────────────
          FLAT_ITEMS
            .filter(item => {
              if (!item.roles.includes(userRole)) return false;
              if (allowedPages && allowedPages.length > 0) return allowedPages.includes(item.id);
              return true;
            })
            .map(item => {
              const Icon     = item.icon;
              const isActive = activePage === item.id;
              return (
                <button key={item.id} onClick={() => onNavigate(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left"
                  style={isActive
                    ? { backgroundColor: "#0f5b43", color: "#ffffff" }
                    : { color: "#4b5563" }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "#ece9e3"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm" style={{ fontFamily: "var(--font-body)" }}>{item.label}</span>
                </button>
              );
            })
        )}
      </nav>

      {/* Footer */}
      <div className="p-3" style={{ borderTop: "1px solid #ece9e3" }}>
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left"
          style={{ color: "#6b7280" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#ece9e3")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm" style={{ fontFamily: "var(--font-body)" }}>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
