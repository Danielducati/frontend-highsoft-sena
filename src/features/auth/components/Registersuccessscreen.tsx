import { Card, CardContent } from "../../../shared/ui/card";
import { Sparkles, CheckCircle2 } from "lucide-react";

export function RegisterSuccessScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#78D1BD]/10 via-[#60A5FA]/10 to-[#A78BFA]/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-gray-200 shadow-2xl">
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl text-gray-900">¡Registro Exitoso!</h2>
              <p className="text-gray-600">
                Tu cuenta ha sido creada correctamente. Bienvenido a HIGHLIFE SPA & BAR.
              </p>
            </div>
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
              <CheckCircle2 className="w-4 h-4 text-[#78D1BD]" />
              <span>Usuario registrado exitosamente</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
