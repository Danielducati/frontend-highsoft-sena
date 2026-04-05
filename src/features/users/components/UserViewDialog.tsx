import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { User } from "../types";
import { getRoleBadgeColor } from "../utils";

interface UserViewDialogProps {
  user: User | null;
  onClose: () => void;
}

export function UserViewDialog({ user, onClose }: UserViewDialogProps) {
  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="rounded-xl max-w-md">
        <DialogHeader><DialogTitle>Detalles del Usuario</DialogTitle></DialogHeader>
        {user && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] flex items-center justify-center text-white text-xl flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 truncate">{user.name}</p>
                <Badge className={`${getRoleBadgeColor(user.role)} text-xs mt-1`}>{user.role}</Badge>
              </div>
              <Badge className={`text-xs flex-shrink-0 ${user.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {user.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Email</p>
                <p className="text-gray-900 break-all">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Teléfono</p>
                <p className="text-gray-900">{user.phone || "-"}</p>
              </div>
              <div>
                <p className="text-gray-500">Documento</p>
                <p className="text-gray-900">{user.tipo_documento} {user.numero_documento || "-"}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>Cerrar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
