import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Client } from "../types";

interface ClientViewDialogProps {
  client: Client | null;
  onClose: () => void;
}

export function ClientViewDialog({ client, onClose }: ClientViewDialogProps) {
  return (
    <Dialog open={!!client} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles del Cliente</DialogTitle>
        </DialogHeader>
        {client && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] flex items-center justify-center text-white text-xl">
                {client.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900">{client.name}</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{client.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="text-gray-900">{client.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Total Visitas</p>
                <p className="text-gray-900">{client.totalVisits}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Total Gastado</p>
                <p className="text-gray-900">${client.totalSpent.toLocaleString()}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-sm text-gray-500">Dirección</p>
                <p className="text-gray-900">{client.address || "No especificada"}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}