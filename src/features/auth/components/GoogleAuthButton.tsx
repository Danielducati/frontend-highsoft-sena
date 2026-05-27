import { Button } from "../../../shared/ui/button";
import { Loader2 } from "lucide-react";

type GoogleAuthButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
};

export function GoogleAuthButton({
  onClick,
  disabled,
  loading,
  label = "Continuar con Google",
}: GoogleAuthButtonProps) {
  return (
    <Button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className="w-full h-11 rounded-full border flex items-center justify-center gap-2.5"
      style={{
        backgroundColor: "#ffffff",
        color: "#1f2937",
        borderColor: "#d1d5db",
        fontWeight: 500,
      }}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.8-6-6.2s2.7-6.2 6-6.2c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 2.5 14.7 1.6 12 1.6 6.9 1.6 2.8 5.9 2.8 11s4.1 9.4 9.2 9.4c5.3 0 8.8-3.8 8.8-9.1 0-.6-.1-1-.1-1.1H12z"
          />
          <path
            fill="#34A853"
            d="M2.8 7.1l3.2 2.3c.9-2.1 3-3.6 6-3.6 1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 2.5 14.7 1.6 12 1.6 8.3 1.6 5 3.7 2.8 7.1z"
          />
          <path
            fill="#4A90E2"
            d="M12 20.4c2.6 0 4.8-.9 6.4-2.5l-3-2.5c-.8.6-2 1.1-3.4 1.1-2.9 0-5.3-1.9-6.1-4.5l-3.2 2.5c2.1 3.5 5.6 5.9 9.3 5.9z"
          />
          <path
            fill="#FBBC05"
            d="M5.9 12c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9L2.8 5.7C2 7.2 1.6 9 1.6 10.8s.4 3.6 1.2 5.1L5.9 12z"
          />
        </svg>
      )}
      {loading ? "Conectando..." : label}
    </Button>
  );
}
