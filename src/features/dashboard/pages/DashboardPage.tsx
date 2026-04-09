// frontend-highsoft-sena/src/features/dashboard/pages/DashboardPage.tsx
import { Button } from "../../../shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/ui/select";
import { Sparkles, Filter, Download } from "lucide-react";
import { PERIOD_OPTIONS } from "../constants";
import { useDashboard } from "../hooks/useDashboard";
import { exportDashboardReport } from "../utils";
import { StatCard } from "../components/StatCard";
import { SalesChart } from "../components/SalesChart";
import { ServicesChart } from "../components/ServicesChart";
import { RevenueChart } from "../components/RevenueChart";
import { ServicesRanking } from "../components/ServicesRanking";
import { SpaPage } from "../../../shared/components/layout/SpaPage";

export function DashboardPage() {
  const {
    period,
    data,
    loading,
    statsCards,
    handleFilterChange,
    periodLabel,
  } = useDashboard();

  return (
    <SpaPage
      title="Dashboard Analítico"
      subtitle="Vista general del rendimiento del spa"
      icon={<Sparkles className="w-6 h-6 text-[#78D1BD]" />}
      action={
        <div
          className="flex flex-wrap gap-3"
        >
          <Select value={period} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-44 rounded-lg border-gray-200 bg-white">
              <Filter className="w-4 h-4 mr-2 text-gray-500" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() =>
              data && exportDashboardReport(data, period, periodLabel)
            }
            disabled={!data}
            className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white rounded-lg shadow-md"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Reporte
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Cargando dashboard...
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No se pudieron cargar los datos
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {statsCards.map((stat, i) => (
                <StatCard
                  key={i}
                  {...stat}
                  change={stat.change != null ? String(stat.change) : undefined}
                  periodLabel={periodLabel}
                />
              ))}
            </div>

            {/* Gráficas */}
            <div className="grid lg:grid-cols-2 gap-6">
              <SalesChart
                data={data.salesData ?? []}
                periodLabel={periodLabel}
              />
              <ServicesChart
                data={data.servicesData ?? []}
                periodLabel={periodLabel}
              />
            </div>

            <RevenueChart
              data={data.servicesData ?? []}
              periodLabel={periodLabel}
            />

            <ServicesRanking
              data={data.servicesData ?? []}
              periodLabel={periodLabel}
            />
          </>
        )}
      </div>
    </SpaPage>
  );
}