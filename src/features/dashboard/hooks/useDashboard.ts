import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DashboardData } from "../types";
import { fetchDashboardApi } from "../services/dashboardService";
import { getPeriodLabel } from "../utils";
import { DollarSign, Users, Calendar, CheckCircle } from "lucide-react";

export function useDashboard() {
  const [period,  setPeriod]  = useState("30days");
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async (p: string) => {
    try {
      setLoading(true);
      const json = await fetchDashboardApi(p);
      setData(json);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar el dashboard";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(period); }, [period]);

  const handleFilterChange = (value: string) => {
    setPeriod(value);
    toast.success(`Filtro aplicado: ${getPeriodLabel(value)}`, { duration: 2000 });
  };

  const statsCards = data ? [
    { title: "Ventas Totales",        value: `$${data.stats.ventasTotales.toLocaleString()}`,   change: data.stats.ventasChange,        icon: DollarSign,  color: "from-emerald-400 to-emerald-500" },
    { title: "Clientes Activos",      value: data.stats.clientesActivos.toLocaleString(),       change: null,                           icon: Users,       color: "from-blue-400 to-blue-500"      },
    { title: "Citas del Período",     value: data.stats.citasDelPeriodo.toLocaleString(),       change: data.stats.citasChange,         icon: Calendar,    color: "from-purple-400 to-purple-500"  },
    { title: "Servicios Completados", value: data.stats.serviciosCompletados.toLocaleString(),  change: data.stats.serviciosChange,     icon: CheckCircle, color: "from-amber-400 to-amber-500"    },
  ] : [];

  return {
    period, data, loading,
    statsCards,
    handleFilterChange,
    periodLabel: getPeriodLabel(period),
  };
}