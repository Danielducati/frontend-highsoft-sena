// frontend-highsoft-sena/src/features/dashboard/hooks/useDashboard.ts
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DashboardData } from "../types";
import { fetchDashboardApi } from "../services/dashboardService";
import { getPeriodLabel } from "../utils";
import { DollarSign, Users, Calendar, CheckCircle } from "lucide-react";

export function useDashboard() {
  const [period, setPeriod] = useState("30days");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async (p: string) => {
    try {
      setLoading(true);
      const json = await fetchDashboardApi(p);

      console.log("DASHBOARD DATA:", json); // 👈 DEBUG (puedes quitar luego)

      setData(json);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al cargar el dashboard";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(period);
  }, [period]);

  const handleFilterChange = (value: string) => {
    setPeriod(value);
    toast.success(`Filtro aplicado: ${getPeriodLabel(value)}`, {
      duration: 2000,
    });
  };

  // ✅ PROTECCIÓN TOTAL CONTRA undefined
  const stats = data?.stats;

  const statsCards = stats
    ? [
        {
          title: "Ingresos Totales",
          value: `$${(stats.ventasTotales ?? 0).toLocaleString()}`,
          change: stats.ventasChange ?? 0,
          icon: DollarSign,
          color: "from-emerald-400 to-emerald-500",
        },
        {
          title: "Clientes Activos",
          value: (stats.clientesActivos ?? 0).toLocaleString(),
          change: undefined,
          icon: Users,
          color: "from-blue-400 to-blue-500",
        },
        {
          title: "Citas del Período",
          value: (stats.citasDelPeriodo ?? 0).toLocaleString(),
          change: stats.citasChange ?? 0,
          icon: Calendar,
          color: "from-purple-400 to-purple-500",
        },
        {
          title: "Ventas Completadas",
          value: (stats.ventasCompletadas ?? 0).toLocaleString(),
          change: stats.ventasCountChange ?? 0,
          icon: CheckCircle,
          color: "from-amber-400 to-amber-500",
        },
      ]
    : [];

  return {
    period,
    data,
    loading,
    statsCards,
    handleFilterChange,
    periodLabel: getPeriodLabel(period),
  };
}