import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Mail, CheckCircle } from "lucide-react";

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  recoveryEmail: string;
  setRecoveryEmail: (v: string) => void;
  recoverySuccess: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ForgotPasswordDialog({
  open, onClose, recoveryEmail, setRecoveryEmail, recoverySuccess, onSubmit,
}: ForgotPasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        {!recoverySuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Recuperar Contraseña
              </DialogTitle>
              <DialogDescription>
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="recovery-email"
                    type="email"
                    placeholder="tu_correo@ejemplo.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-foreground">
                  Enviar Enlace
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Correo Enviado
              </DialogTitle>
            </DialogHeader>
            <div className="py-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800 mb-1">¡Correo enviado exitosamente!</p>
                    <p className="text-xs text-green-700">
                      Hemos enviado un enlace de recuperación a <span className="font-semibold">{recoveryEmail}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">Nota:</span> Si no recibes el correo, revisa tu carpeta de spam.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-foreground">
                Entendido
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
