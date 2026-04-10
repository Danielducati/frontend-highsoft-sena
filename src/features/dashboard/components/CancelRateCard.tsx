import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../shared/ui/card";
import { XCircle, CheckCircle2, Clock } from "lucide-react";

interface CancelRateCardProps {
  data: { total: number; cancelled: number; rate: string };
  periodLabel: string;
}

export function CancelRateCard({ data, periodLabel }: CancelRateCardProps) {
  const pct = parseFloat(data.rate) || 0;
  const color = pct > 30 ? "#B91C1C" : pct > 15 ? "#D97706" : "#1a3a2a";
  const completed = Math.max(0, data.total - data.cancelled);
  const completedPct = data.total > 0 ? ((completed / data.total) * 100).toFixed(1) : "0";

  const status = pct > 30
    ? { label: "Alta — requiere atención", bg: "#FEE2E2", text: "#B91C1C" }
    : pct > 15
    ? { label: "Moderada — monitorear", bg: "#FEF3C7", text: "#D97706" }
    : { label: "Saludable", bg: "#DCFCE7", text: "#15803D" };

  return (
    <Card className="border-gray-200 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>
          <div className="w-1 h-6 bg-red-500 rounded-full" />
          Tasa de Cancelaciones
        </CardTitle>
        <CardDescription style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
          {periodLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Porcentaje principal */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-5xl font-bold" style={{ color }}>{data.rate}</p>
            <p className="text-sm mt-1" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
              {data.cancelled} de {data.total} citas canceladas
            </p>
          </div>
          <XCircle className="w-14 h-14" style={{ color, opacity: 0.15 }} />
        </div>

        {/* Barra de progreso */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
        </div>

        {/* Estado */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: status.bg, color: status.text }}>
          {pct > 15 ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          {status.label}
        </div>

        {/* Desglose */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: "#15803D" }} />
              <span className="text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>Completadas / Pendientes</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>{completed} ({completedPct}%)</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4" style={{ color }} />
              <span className="text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>Canceladas</span>
            </div>
            <span className="text-sm font-semibold" style={{ color, fontFamily: "var(--font-body)" }}>{data.cancelled} ({data.rate})</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: "#6b7c6b" }} />
              <span className="text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>Total citas</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>{data.total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
