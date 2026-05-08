import { useState, useEffect, useRef } from "react";
import { Bell, Calendar, Clock, X, CheckCheck, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";

interface HeaderProps {
  userRole: 'admin' | 'employee' | 'client';
  userName?: string;
  userPhoto?: string;
  onLogout?: () => void;
}

interface Notification {
  id: number;
  title: string;
  body: string;
  date: string;   // "YYYY-MM-DD"
  time: string;   // "HH:MM"
  read: boolean;
  daysUntil: number;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
const getToken = () => localStorage.getItem("token");

// Devuelve cuántos días faltan desde hoy (Colombia) hasta una fecha "YYYY-MM-DD"
function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function formatRelative(days: number): string {
  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  if (days <= 7)  return `En ${days} días`;
  return `En ${days} días`;
}

function urgencyColor(days: number): string {
  if (days === 0) return "#dc5a4b";
  if (days === 1) return "#f59e0b";
  return "#1a5c3a";
}

async function fetchUpcomingAppointments(userRole: string): Promise<Notification[]> {
  const endpoint =
    userRole === "client"   ? `${API_URL}/appointments/mis-citas`          :
    userRole === "employee" ? `${API_URL}/appointments/mis-citas-empleado`  :
                              `${API_URL}/appointments`;

  const res = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) return [];

  const data: any[] = await res.json();

  // Filtrar citas pendientes en los próximos 7 días
  const today = new Date(); today.setHours(0, 0, 0, 0);

  return data
    .filter(c => {
      const estado = (c.Estado ?? c.estado ?? "").toLowerCase();
      if (estado === "cancelada" || estado === "completada") return false;
      const days = daysUntil(c.Fecha ?? c.fecha ?? "");
      return days >= 0 && days <= 7;
    })
    .map(c => {
      const dateStr  = c.Fecha ?? c.fecha ?? "";
      const timeStr  = c.Horario ?? c.horario ?? "";
      const days     = daysUntil(dateStr);
      const cliente  = c.cliente_nombre ?? c.clientName ?? "Cliente";
      const servicio = (c.servicios?.[0]?.serviceName ?? c.servicios?.[0]?.detalle ?? "Cita");

      return {
        id:        c.PK_id_cita ?? c.id,
        title:     `${formatRelative(days)} — ${servicio}`,
        body:      userRole === "client"
          ? `Tu cita está programada para las ${timeStr || "hora por confirmar"}`
          : `Cliente: ${cliente} · ${timeStr || "hora por confirmar"}`,
        date:      dateStr,
        time:      timeStr,
        read:      false,
        daysUntil: days,
      };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

export function Header({ userRole, userName, userPhoto, onLogout }: HeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open,          setOpen]          = useState(false);
  const [avatarOpen,    setAvatarOpen]    = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarRef   = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read).length;

  // Cargar al montar y cada 5 minutos
  useEffect(() => {
    const load = () =>
      fetchUpcomingAppointments(userRole)
        .then(setNotifications)
        .catch(() => {});
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userRole]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const markRead = (id: number) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const roleLabels = { admin: 'Administrador', employee: 'Empleado', client: 'Cliente' };
  const displayName = userName || roleLabels[userRole];

  // Mostrar el nombre real del rol si está guardado
  const storedUser = (() => { try { return JSON.parse(localStorage.getItem("usuario") ?? "{}"); } catch { return {}; } })();
  const rolLabel = storedUser?.rol ?? roleLabels[userRole];

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'admin':    return 'bg-[#e8f5f0] text-[#1a3a2a] border-[#a8d5c2]';
      case 'employee': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'client':   return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <header
      className="h-16 sticky top-0 z-50 flex items-center justify-between px-8"
      style={{ backgroundColor: "var(--bg-app)", borderBottom: "1px solid var(--border)" }}
    >
      {/* Saludo */}
      <div className="flex items-center gap-6 flex-1">
        <div>
          <h2 style={{ color: "#1a3a2a", fontFamily: "var(--font-body)", fontWeight: 600 }}>
            Bienvenido de nuevo 👋
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
              <span style={{ color: "#1a3a2a", fontWeight: 600 }}>{displayName}</span>
            </p>
            <Badge variant="outline" className={`${getRoleBadgeColor()} text-xs px-2 py-0.5`}>
              {rolLabel}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">

        {/* ── Campana ── */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              position: "relative", width: 38, height: 38, borderRadius: 10,
              border: "none", backgroundColor: open ? "var(--muted)" : "transparent",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#6b7c6b", transition: "background 0.15s",
            }}
            onMouseEnter={e => { if (!open) e.currentTarget.style.backgroundColor = "var(--muted)"; }}
            onMouseLeave={e => { if (!open) e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <Bell style={{ width: 20, height: 20 }} />
            {unread > 0 && (
              <span style={{
                position: "absolute", top: 6, right: 6,
                width: 8, height: 8, borderRadius: "50%",
                backgroundColor: "#dc5a4b",
                boxShadow: "0 0 0 2px #F7F9FC",
              }} />
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              width: 340, borderRadius: 14, backgroundColor: "#ffffff",
              border: "1px solid #E5E7EB", boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
              zIndex: 9999, overflow: "hidden", fontFamily: "var(--font-body)",
            }}>
              {/* Header del dropdown */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px 10px", borderBottom: "1px solid #E5E7EB",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Bell style={{ width: 15, height: 15, color: "#1a3a2a" }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#1a3a2a" }}>
                    Notificaciones
                  </span>
                  {unread > 0 && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: "#fff",
                      backgroundColor: "#dc5a4b", borderRadius: 999,
                      padding: "1px 7px",
                    }}>{unread}</span>
                  )}
                </div>
                {unread > 0 && (
                  <button onClick={markAllRead} style={{
                    display: "flex", alignItems: "center", gap: 4,
                    fontSize: 11, color: "#6b7c6b", background: "none",
                    border: "none", cursor: "pointer", padding: "2px 6px",
                    borderRadius: 6,
                  }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-app)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <CheckCheck style={{ width: 13, height: 13 }} />
                    Marcar todas
                  </button>
                )}
              </div>

              {/* Lista */}
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "32px 16px", textAlign: "center" }}>
                    <Calendar style={{ width: 32, height: 32, color: "#E5E7EB", margin: "0 auto 8px" }} />
                    <p style={{ fontSize: 13, color: "#6b7c6b" }}>No hay citas próximas</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                      Las citas de los próximos 7 días aparecerán aquí
                    </p>
                  </div>
                ) : notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    style={{
                      display: "flex", gap: 12, padding: "12px 16px",
                      borderBottom: "1px solid #E5E7EB", cursor: "pointer",
                      backgroundColor: n.read ? "transparent" : "#ffffff",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-app)")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = n.read ? "transparent" : "#ffffff")}
                  >
                    {/* Ícono con color de urgencia */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      backgroundColor: urgencyColor(n.daysUntil) + "18",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Calendar style={{ width: 16, height: 16, color: urgencyColor(n.daysUntil) }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1a3a2a", margin: 0 }}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span style={{
                            width: 7, height: 7, borderRadius: "50%",
                            backgroundColor: "#dc5a4b", flexShrink: 0,
                          }} />
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: "#6b7c6b", margin: "2px 0 0", lineHeight: 1.4 }}>
                        {n.body}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                        <Clock style={{ width: 11, height: 11, color: "#9ca3af" }} />
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>
                          {n.date.split("-").reverse().join("/")}
                          {n.time ? ` · ${n.time}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div style={{ padding: "10px 16px", borderTop: "1px solid #E5E7EB", textAlign: "center" }}>
                  <p style={{ fontSize: 11, color: "#9ca3af" }}>
                    Mostrando citas de los próximos 7 días
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar con dropdown de logout */}
        <div ref={avatarRef} style={{ position: "relative" }}>
          <button
            onClick={() => setAvatarOpen(o => !o)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, borderRadius: "50%" }}
          >
            <Avatar className="w-9 h-9">
              {userPhoto && <AvatarImage src={userPhoto} alt={displayName} className="object-cover" />}
              <AvatarFallback style={{ background: "linear-gradient(135deg, #1a3a2a, #2a5a40)", color: "#fff" }}>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>

          {avatarOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              minWidth: 180, borderRadius: 12, backgroundColor: "#ffffff",
              border: "1px solid #E5E7EB", boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
              zIndex: 9999, overflow: "hidden", fontFamily: "var(--font-body)",
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #E5E7EB" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1a3a2a", margin: 0 }}>{displayName}</p>
                <p style={{ fontSize: 11, color: "#6b7c6b", margin: "2px 0 0" }}>{rolLabel}</p>
              </div>
              <button
                onClick={() => { setAvatarOpen(false); onLogout?.(); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 16px", border: "none", backgroundColor: "transparent",
                  cursor: "pointer", fontSize: 13, color: "#b14b3d", fontFamily: "var(--font-body)",
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fdf2f2")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <LogOut style={{ width: 15, height: 15 }} />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
