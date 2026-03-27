import { Bell } from "lucide-react";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Badge } from "../../ui/badge";

interface HeaderProps {
  userRole: 'admin' | 'employee' | 'client';
  userName?: string;
}

export function Header({ userRole, userName }: HeaderProps) {
  const roleLabels = {
    admin: 'Administrador',
    employee: 'Empleado',
    client: 'Cliente'
  };

  const displayName = userName || roleLabels[userRole];

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'employee':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'client':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <header
      className="h-16 sticky top-0 z-40 flex items-center justify-between px-8"
      style={{ backgroundColor: "#f5f0e8", borderBottom: "1px solid #e8e2d8" }}
    >
      <div className="flex items-center gap-6 flex-1">
        <div>
          <h2 style={{ color: "#1a3a2a", fontFamily: "var(--font-display)" }}>Bienvenido de nuevo 👋</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>{displayName}</p>
            <Badge variant="outline" className={`${getRoleBadgeColor()} text-xs px-2 py-0.5`}>
              {roleLabels[userRole]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-lg"
          style={{ color: "#6b7c6b" }}
        >
          <Bell className="w-5 h-5" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: "#dc5a4b", boxShadow: "0 0 0 2px #f5f0e8" }}
          ></span>
        </Button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-2">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] text-white">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
