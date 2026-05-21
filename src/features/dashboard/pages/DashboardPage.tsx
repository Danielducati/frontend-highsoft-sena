// frontend-highsoft-sena/src/features/dashboard/pages/DashboardPage.tsx
import { useState, useRef, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/ui/select";
import { Sparkles, Filter, Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { PERIOD_OPTIONS } from "../constants";
import { useDashboard } from "../hooks/useDashboard";
import { exportDashboardReport, exportDashboardPDF } from "../utils";
import { StatCard } from "../components/StatCard";
import { SalesChart } from "../components/SalesChart";
import { ServicesChart } from "../components/ServicesChart";
import { RevenueChart } from "../components/RevenueChart";
import { CancelRateCard } from "../components/CancelRateCard";
import { UpcomingAppointments } from "../components/UpcomingAppointments";
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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <SpaPage
      title="Dashboard Analítico"
      subtitle="Vista general del rendimiento del spa"
      icon={<Sparkles className="w-6 h-6 text-[#1a5c3a]" />}
      action={
        <div className="flex flex-wrap gap-3 items-center">
          {/* Filtro de período */}
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

          {/* Botón exportar con dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            {/* Botón principal */}
            <button
              disabled={!data}
              onClick={() => setDropdownOpen(prev => !prev)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "9px 16px", borderRadius: 8,
                backgroundColor: "#1a3a2a", color: "#ffffff",
                fontSize: 14, fontWeight: 600, border: "none",
                cursor: data ? "pointer" : "not-allowed",
                opacity: data ? 1 : 0.5,
                fontFamily: "var(--font-body)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              }}
              onMouseEnter={e => { if (data) e.currentTarget.style.backgroundColor = "#2a5a40"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#1a3a2a"; }}
            >
              <Download style={{ width: 15, height: 15 }} />
              Exportar
              <ChevronDown style={{
                width: 14, height: 14,
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }} />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0,
                backgroundColor: "#ffffff", borderRadius: 10,
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                minWidth: 180, zIndex: 50, overflow: "hidden",
              }}>
                {/* Excel */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    if (data) exportDashboardReport(data, period, periodLabel);
                  }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "11px 16px", border: "none", backgroundColor: "transparent",
                    cursor: "pointer", fontSize: 13, color: "#1f2937",
                    fontFamily: "var(--font-body)", textAlign: "left",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#edf7f4")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <FileSpreadsheet style={{ width: 16, height: 16, color: "#1a5c3a", flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>Exportar Excel</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Archivo .xlsx con datos</p>
                  </div>
                </button>

                <div style={{ height: 1, backgroundColor: "#f3f4f6", margin: "0 12px" }} />

                {/* PDF */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    if (data) exportDashboardPDF(data, period, periodLabel);
                  }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "11px 16px", border: "none", backgroundColor: "transparent",
                    cursor: "pointer", fontSize: 13, color: "#1f2937",
                    fontFamily: "var(--font-body)", textAlign: "left",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#edf7f4")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <FileText style={{ width: 16, height: 16, color: "#1a3a2a", flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>Exportar PDF</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Abre para imprimir / guardar</p>
                  </div>
                </button>
              </div>
            )}
          </div>
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

            {/* Fila 1: Ventas por mes (2/3) + Distribución servicios (1/3) */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SalesChart
                  data={data.salesData ?? []}
                  periodLabel={periodLabel}
                  period={period}
                />
              </div>
              <ServicesChart
                data={data.servicesData ?? []}
                periodLabel={periodLabel}
              />
            </div>

            {/* Fila 2: Ingresos por servicio (2/3) + Tasa cancelaciones (1/3) */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RevenueChart
                  data={data.servicesData ?? []}
                  periodLabel={periodLabel}
                />
              </div>
              <CancelRateCard
                data={data.cancelRate ?? { total: 0, cancelled: 0, rate: "0%" }}
                periodLabel={periodLabel}
              />
            </div>

            <UpcomingAppointments data={data.upcomingAppointments ?? []} />
          </>
        )}
      </div>
    </SpaPage>
  );
}
