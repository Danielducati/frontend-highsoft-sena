import { 
  LayoutDashboard, 
  Sparkles,
  Package,
  FolderOpen,
  Newspaper, 
  Calendar, 
  Clock,
  FileText,
  ShoppingCart,
  Users,
  Settings, 
  LogOut,
  UserCircle,
  Shield,
  UserCog,
  Briefcase
} from "lucide-react";
import { cn } from "../../ui/utils";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userRole: 'admin' | 'employee' | 'client';
}

export function Sidebar({ activePage, onNavigate, onLogout, userRole }: SidebarProps) {
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      roles: ['admin']
    },
    { 
      id: 'services', 
      label: 'Servicios', 
      icon: Package,
      roles: ['admin']
    },
    { 
      id: 'categories', 
      label: 'Categorías de servicios', 
      icon: FolderOpen,
      roles: ['admin']
    },
    { 
      id: 'news', 
      label: 'Novedades', 
      icon: Newspaper,
      roles: ['admin', 'employee']
    },
    { 
      id: 'appointments', 
      label: 'Citas', 
      icon: Calendar,
      roles: ['admin', 'employee', 'client']
    },
    { 
      id: 'schedules', 
      label: 'Horarios', 
      icon: Clock,
      roles: ['admin']
    },
    { 
      id: 'quotations', 
      label: 'Cotizaciones', 
      icon: FileText,
      roles: ['admin']
    },
    { 
      id: 'sales', 
      label: 'Ventas', 
      icon: ShoppingCart,
      roles: ['admin']
    },
    { 
      id: 'clients', 
      label: 'Clientes', 
      icon: Users,
      roles: ['admin']
    },
    { 
      id: 'employees', 
      label: 'Empleados', 
      icon: Briefcase,
      roles: ['admin']
    },
    { 
      id: 'users', 
      label: 'Usuarios', 
      icon: UserCog,
      roles: ['admin']
    },
    { 
      id: 'roles', 
      label: 'Roles y Permisos', 
      icon: Shield,
      roles: ['admin']
    },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  const roleLabels = {
    admin: 'Administrador',
    employee: 'Empleado',
    client: 'Cliente'
  };

  return (
    <aside
      className="w-64 flex flex-col h-screen fixed left-0 top-0"
      // Color de fondo de la sidebar
      style={{ backgroundColor: " #f5f0e8", borderRight: "2px solid #e8e6e1" }}
    >
      {/* Logo Section */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid #ece9e3" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1a3a2a,rgb(78, 174, 115))" }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="tracking-tight leading-none" style={{ color: " #1a3a2a", fontFamily: "var(--font-display)" }}>
              High Life Spa Peorrotes
            </h2>
            <p className="text-[10px] tracking-[0.18em] mt-1" style={{ color: " #8a948b", fontFamily: "var(--font-body)" }}>
              MANAGEMENT SUITE
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left",
                isActive 
                  ? "text-white shadow-sm" 
                  : "hover:bg-[ #ece9e3]"
              )}
              style={
                isActive
                  ? { backgroundColor: "#0f5b43" }
                  : { color: "#6b7c6b" }
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm" style={{ fontFamily: "var(--font-body)" }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 space-y-3" style={{ borderTop: "1px solid #ece9e3" }}>
        {/* User Card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ backgroundColor: "#efeee9" }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #78D1BD, #5FBFAA)" }}
          >
            <UserCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>{roleLabels[userRole]}</p>
            <p className="text-xs" style={{ color: "#8a948b", fontFamily: "var(--font-body)" }}>Sesión activa</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200"
          style={{ color: "#6b7c6b" }}
          onClick={onLogout}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f5e8e6";
            e.currentTarget.style.color = "#b14b3d";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#6b7c6b";
          }}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm" style={{ fontFamily: "var(--font-body)" }}>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
