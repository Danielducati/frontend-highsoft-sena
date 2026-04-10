import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Client } from "../types";
import { Mail, Phone, MapPin, FileText, Calendar, ShoppingBag, DollarSign } from "lucide-react";
import { ImageWithFallback } from "../../guidelines/figma/ImageWithFallback";

interface ClientViewDialogProps {
  client: Client | null;
  onClose: () => void;
}

export function ClientViewDialog({ client, onClose }: ClientViewDialogProps) {
  return (
    <Dialog open={!!client} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Detalles del Cliente</DialogTitle>
        </DialogHeader>
        {client && (
          <div className="space-y-5 mt-2" style={{ fontFamily: "var(--font-body)" }}>

            {/* Avatar + nombre */}
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: "#f5f2ed" }}>
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white shadow">
                {client.image ? (
                  <ImageWithFallback src={client.image} alt={client.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-semibold"
                    style={{ background: "linear-gradient(135deg, #78D1BD, #5FBFAA)" }}>
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-base" style={{ color: "#1a3a2a" }}>{client.name}</p>
                {client.tipo_documento && client.numero_documento && (
                  <p className="text-xs mt-0.5" style={{ color: "#6b7c6b" }}>
                    {client.tipo_documento}: {client.numero_documento}
                  </p>
                )}
                <span style={{
                  display: "inline-flex", marginTop: 6, padding: "2px 10px",
                  borderRadius: 999, fontSize: 11, fontWeight: 600,
                  backgroundColor: client.isActive ? "#edf7f4" : "#f3f4f6",
                  color: client.isActive ? "#1a5c3a" : "#6b7280",
                }}>
                  {client.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>

            {/* Contacto */}
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-widest" style={{ color: "#6b7c6b" }}>CONTACTO</p>
              <div className="grid grid-cols-1 gap-2">
                <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={client.email || "—"} />
                <InfoRow icon={<Phone className="w-4 h-4" />} label="Teléfono" value={client.phone || "—"} />
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Dirección" value={client.address || "No especificada"} />
              </div>
            </div>

            {/* Estadísticas */}
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-widest" style={{ color: "#6b7c6b" }}>ESTADÍSTICAS</p>
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  icon={<ShoppingBag className="w-4 h-4" />}
                  label="Visitas"
                  value={String(client.totalVisits)}
                />
                <StatCard
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Total gastado"
                  value={`$${client.totalSpent.toLocaleString("es-CO")}`}
                />
                <StatCard
                  icon={<Calendar className="w-4 h-4" />}
                  label="Última visita"
                  value={client.lastVisit}
                />
              </div>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-3 py-2 rounded-lg" style={{ backgroundColor: "#faf7f2" }}>
      <span style={{ color: "#6b7c6b", marginTop: 1 }}>{icon}</span>
      <div className="min-w-0">
        <p className="text-xs" style={{ color: "#6b7c6b" }}>{label}</p>
        <p className="text-sm font-medium truncate" style={{ color: "#1a3a2a" }}>{value}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-xl text-center" style={{ backgroundColor: "#faf7f2" }}>
      <span style={{ color: "#5FBFAA" }}>{icon}</span>
      <p className="text-xs" style={{ color: "#6b7c6b" }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: "#1a3a2a" }}>{value}</p>
    </div>
  );
}
