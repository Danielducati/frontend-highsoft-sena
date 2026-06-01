import { useState } from "react";
import {
  LayoutDashboard, Sparkles, Package, FolderOpen, Newspaper,
  Calendar, Clock, FileText, ShoppingCart, Users,
  Shield, UserCog, Briefcase, ChevronDown, Settings,
} from "lucide-react";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userRole: 'admin' | 'employee' | 'client';
  allowedPages?: string[];
}

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
      { id: "roles", label: "Roles y Permisos", icon: Shield,  roles: ["admin"] },
      { id: "users", label: "Usuarios",          icon: UserCog, roles: ["admin"] },
    ],
  },
  {
    id: "empleados_group",
    label: "Empleados",
    icon: Briefcase,
    roles: ["admin"],
    children: [
      { id: "employees", label: "Empleados", icon: Briefcase, roles: ["admin"] },
      { id: "schedules", label: "Horarios",  icon: Clock,     roles: ["admin"] },
      { id: "news",      label: "Novedades", icon: Newspaper, roles: ["admin", "employee"] },
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
      { id: "clients",     label: "Clientes",     icon: Users,        roles: ["admin"] },
      { id: "quotations",  label: "Cotizaciones", icon: FileText,     roles: ["admin"] },
      { id: "appointments",label: "Citas",        icon: Calendar,     roles: ["admin", "employee", "client"] },
      { id: "sales",       label: "Ventas",       icon: ShoppingCart, roles: ["admin"] },
    ],
  },
];

const FLAT_ITEMS = [
  { id: "appointments", label: "Citas",     icon: Calendar,  roles: ["employee", "client"] },
  { id: "news",         label: "Novedades", icon: Newspaper, roles: ["employee"] },
];

export function Sidebar({ activePage, onNavigate, onLogout, userRole, allowedPages }: SidebarProps) {
  const findInitialOpen = () => {
    for (const g of GROUPS) {
      if (g.children.some(c => c.id === activePage)) return g.id;
    }
    return null;
  };
  const [openGroup, setOpenGroup] = useState<string | null>(findInitialOpen);

  const toggle = (id: string) => setOpenGroup(prev => prev === id ? null : id);

  const isAllowed = (roles: string[]) => {
    if (userRole === "admin") return roles.includes("admin");
    return (allowedPages ?? []).includes(roles[0]) || roles.includes(userRole);
  };

  return (
    <>
      {/* Animación CSS inline */}
      <style>{`
        .sidebar-children {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.25s ease, opacity 0.2s ease;
        }
        .sidebar-children.open {
          max-height: 400px;
          opacity: 1;
        }
        .sidebar-chevron {
          transition: transform 0.25s ease;
        }
        .sidebar-chevron.open {
          transform: rotate(180deg);
        }
      `}</style>

      <aside
        style={{
          width: 240, display: "flex", flexDirection: "column",
          height: "100vh", position: "fixed", left: 0, top: 0,
          backgroundColor: "var(--bg-app)",
          borderRight: "1px solid #e9e9e9",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #ece9e3" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #1a3a2a, #2a6a4a)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Sparkles style={{ width: 18, height: 18, color: "#fff" }} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1a3a2a", margin: 0, fontFamily: "var(--font-display)" }}>
                Highlife Spa
              </p>
              <p style={{ fontSize: 11, color: "#8a948b", margin: 0, fontFamily: "var(--font-body)" }}>
                Management Suite
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 10px", overflowY: "auto" }}>
          {userRole === "admin" ? (
            GROUPS.map(group => {
              if (!isAllowed(group.roles)) return null;
              const Icon     = group.icon;
              const isOpen   = openGroup === group.id;
              const hasActive = group.children.some(c => c.id === activePage);
              const isDirect  = activePage === group.id;

              if (group.children.length === 0) {
                return (
                  <button key={group.id} onClick={() => onNavigate(group.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                      backgroundColor: isDirect ? "#0f5b43" : "transparent",
                      color: isDirect ? "#fff" : "#4b5563",
                      fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
                      textAlign: "left", marginBottom: 1,
                    }}
                    onMouseEnter={e => { if (!isDirect) e.currentTarget.style.backgroundColor = "#ece9e3"; }}
                    onMouseLeave={e => { if (!isDirect) e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                    {group.label}
                  </button>
                );
              }

              return (
                <div key={group.id} style={{ marginBottom: 1 }}>
                  {/* Cabecera del grupo */}
                  <button onClick={() => toggle(group.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                      backgroundColor: hasActive && !isOpen ? "#edf7f4" : "transparent",
                      color: hasActive ? "#1a3a2a" : "#4b5563",
                      fontFamily: "var(--font-body)", fontSize: 13,
                      fontWeight: hasActive ? 600 : 400,
                      textAlign: "left",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#ece9e3"; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = hasActive && !isOpen ? "#edf7f4" : "transparent"; }}
                  >
                    <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{group.label}</span>
                    <ChevronDown
                      className={`sidebar-chevron${isOpen ? " open" : ""}`}
                      style={{ width: 14, height: 14, color: "#9ca3af" }}
                    />
                  </button>

                  {/* Hijos con animación */}
                  <div className={`sidebar-children${isOpen ? " open" : ""}`}>
                    <div style={{
                      marginLeft: 12, paddingLeft: 10,
                      borderLeft: "2px solid #e5e7eb",
                      paddingTop: 2, paddingBottom: 4,
                    }}>
                      {group.children
                        .filter(c => isAllowed(c.roles))
                        .map(child => {
                          const ChildIcon = child.icon;
                          const isActive  = activePage === child.id;
                          return (
                            <button key={child.id} onClick={() => onNavigate(child.id)}
                              style={{
                                width: "100%", display: "flex", alignItems: "center", gap: 8,
                                padding: "6px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                                backgroundColor: isActive ? "#0f5b43" : "transparent",
                                color: isActive ? "#fff" : "#6b7280",
                                fontFamily: "var(--font-body)", fontSize: 13,
                                textAlign: "left", marginBottom: 1,
                              }}
                              onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "#ece9e3"; }}
                              onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
                            >
                              <ChildIcon style={{ width: 14, height: 14, flexShrink: 0 }} />
                              {child.label}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            FLAT_ITEMS
              .filter(item => {
                if (!item.roles.includes(userRole)) return false;
                if (allowedPages?.length) return allowedPages.includes(item.id);
                return true;
              })
              .map(item => {
                const Icon     = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button key={item.id} onClick={() => onNavigate(item.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                      backgroundColor: isActive ? "#0f5b43" : "transparent",
                      color: isActive ? "#fff" : "#4b5563",
                      fontFamily: "var(--font-body)", fontSize: 13,
                      textAlign: "left", marginBottom: 1,
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "#ece9e3"; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                    {item.label}
                  </button>
                );
              })
          )}
        </nav>

      </aside>
    </>
  );
}
