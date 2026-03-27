import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Badge } from "../../../shared/ui/badge";
import { Card, CardContent } from "../../../shared/ui/card";
import { Eye, Clock, DollarSign, Tag } from "lucide-react";
import { ImageWithFallback } from "../../guidelines/figma/ImageWithFallback";
import { Service } from "../types";

interface ServiceViewDialogProps {
  service: Service | null;
  onClose: () => void;
}

export function ServiceViewDialog({ service, onClose }: ServiceViewDialogProps) {
  return (
    <Dialog open={service !== null} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {service && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#78D1BD]" />
                Detalle del Servicio
              </DialogTitle>
              <DialogDescription>{service.category}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {service.image && (
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <ImageWithFallback src={service.image} alt={service.name} className="w-full h-72 object-cover" />
                </div>
              )}
              <div>
                <h3 className="text-2xl text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#78D1BD]/10 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-[#78D1BD]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duración</p>
                        <p className="text-xl text-gray-900">{service.duration} min</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#FBBF24]/10 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-[#FBBF24]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Precio</p>
                        <p className="text-xl text-gray-900">${service.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#78D1BD]/10 flex items-center justify-center">
                        <Tag className="w-6 h-6 text-[#78D1BD]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Categoría</p>
                        <Badge variant="outline" className="mt-1">{service.category}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${service.isActive ? "bg-green-100" : "bg-red-100"}`}>
                        <div className={`w-6 h-6 rounded-full ${service.isActive ? "bg-green-500" : "bg-red-500"}`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Estado</p>
                        <Badge className={service.isActive ? "bg-[#78D1BD] text-white mt-1" : "bg-gray-500 text-white mt-1"}>
                          {service.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}