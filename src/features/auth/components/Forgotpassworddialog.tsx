import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  recoveryEmail: string;
  setRecoveryEmail: (v: string) => void;
  recoverySuccess: boolean;
  recoveryLoading?: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ForgotPasswordDialog({
  open, onClose, recoveryEmail, setRecoveryEmail,
  recoverySuccess, recoveryLoading = false, onSubmit,
}: ForgotPasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[340px] p-5" style={{ borderRadius: 14 }}>
        {!recoverySuccess ? (
          <>
            <DialogHeader className="space-y-1">
              <div className="flex justify-center mb-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "#e8f7f4" }}>
                  <Mail className="w-4 h-4" style={{ color: "#1a5c3a" }} />
                </div>
              </div>
              <DialogTitle className="text-center text-base font-normal" style={{ color: "#1a3a2a" }}>
                Recuperar contraseña
              </DialogTitle>
              <DialogDescription className="text-center text-[11px]" style={{ color: "#6b7c6b" }}>
                Te enviaremos un enlace para restablecerla.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} className="space-y-3 pt-1">
              <div className="space-y-1">
                <Label className="text-[10px] tracking-[0.18em]" style={{ color: "#6b7c6b" }}>
                  CORREO ELECTRÓNICO
                </Label>
                <Input
                  id="recovery-email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="h-9 rounded-lg border-0 text-sm"
                  style={{ backgroundColor: "#ece7df", color: "#1a3a2a" }}
                  disabled={recoveryLoading}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" onClick={onClose}
                  disabled={recoveryLoading}
                  className="flex-1 h-9 rounded-lg text-xs"
                  style={{ borderColor: "#d6cfc4", color: "#6b7c6b" }}>
                  Cancelar
                </Button>
                <Button type="submit"
                  disabled={recoveryLoading || !recoveryEmail}
                  className="flex-1 h-9 rounded-lg text-xs"
                  style={{ backgroundColor: "#1a3a2a", color: "#ffffff", fontWeight: 600 }}>
                  {recoveryLoading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Enviando...
                    </span>
                  ) : "Enviar enlace"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader className="space-y-1">
              <div className="flex justify-center mb-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "#e8f7f4" }}>
                  <CheckCircle className="w-4 h-4" style={{ color: "#1a5c3a" }} />
                </div>
              </div>
              <DialogTitle className="text-center text-base font-normal" style={{ color: "#1a3a2a" }}>
                ¡Revisa tu correo!
              </DialogTitle>
              <DialogDescription className="text-center text-[11px]" style={{ color: "#6b7c6b" }}>
                Enviamos el enlace a <span className="font-medium" style={{ color: "#1a3a2a" }}>{recoveryEmail}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg p-2.5 text-[11px] mt-2" style={{ backgroundColor: "#f5f0e8", color: "#6b7c6b" }}>
              Si no recibes el correo, revisa tu carpeta de spam.
            </div>

            <Button onClick={onClose} className="w-full h-9 rounded-lg text-xs mt-1"
              style={{ backgroundColor: "#1a3a2a", color: "#ffffff", fontWeight: 600 }}>
              Entendido
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
