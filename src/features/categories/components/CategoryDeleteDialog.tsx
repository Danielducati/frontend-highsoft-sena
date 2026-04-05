import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../../../shared/ui/alert-dialog";

interface CategoryDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}

export function CategoryDeleteDialog({ isOpen, onOpenChange, onConfirm }: CategoryDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent
        style={{
          backgroundColor: "#faf7f2",
          borderRadius: 16,
          border: "1px solid #ede8e0",
          padding: 32,
          maxWidth: 420,
          fontFamily: "var(--font-body)",
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              color: "#1a3a2a",
              fontWeight: "normal",
            }}
          >
            ¿Eliminar esta categoría?
          </AlertDialogTitle>
          <AlertDialogDescription style={{ color: "#6b7c6b", fontSize: 14, marginTop: 8 }}>
            La categoría pasará a estado <strong>Inactivo</strong> y no aparecerá en el sistema.
            Esta acción puede revertirse desde la tabla de categorías.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              border: "1px solid #d6cfc4",
              backgroundColor: "transparent",
              color: "#1a3a2a",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              border: "none",
              backgroundColor: "#c0392b",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#a93226")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#c0392b")}
          >
            Confirmar eliminación
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
