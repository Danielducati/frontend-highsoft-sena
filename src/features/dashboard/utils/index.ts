import { toast } from "sonner";
import { DashboardData } from "../types";
import { PERIOD_OPTIONS } from "../constants";

export function getPeriodLabel(period: string): string {
  return PERIOD_OPTIONS.find(o => o.value === period)?.label ?? "Período seleccionado";
}

export function exportDashboardReport(data: DashboardData, period: string, periodLabel: string) {
  toast.promise(
    new Promise(resolve => setTimeout(() => resolve(true), 1500)),
    {
      loading: "Generando reporte PDF...",
      success: () => {
        const { stats, salesData, servicesData } = data;
        const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Reporte Dashboard - HIGHLIFE SPA & BAR</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1f2937; }
  h1 { color: #78D1BD; font-size: 28px; text-align:center; margin-bottom:8px; }
  .sub { text-align:center; color:#6b7280; margin-bottom:30px; }
  .grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; margin-bottom:30px; }
  .card { padding:20px; border-left:4px solid #78D1BD; background:#f9fafb; border-radius:8px; }
  .label { font-size:12px; color:#6b7280; text-transform:uppercase; }
  .value { font-size:28px; font-weight:700; margin:4px 0; }
  .change { font-size:13px; color:#10b981; }
  table { width:100%; border-collapse:collapse; margin-bottom:30px; }
  th { background:#78D1BD; color:white; padding:10px; text-align:left; }
  td { padding:10px; border-bottom:1px solid #e5e7eb; }
  .footer { text-align:center; color:#9ca3af; font-size:12px; margin-top:40px; }
</style>
</head>
<body>
<h1>🌟 HIGHLIFE SPA & BAR</h1>
<p class="sub">Reporte Dashboard — ${periodLabel} — ${new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}</p>
<div class="grid">
  <div class="card"><div class="label">Ventas Totales</div><div class="value">$${stats.ventasTotales.toLocaleString()}</div><div class="change">${stats.ventasChange} vs período anterior</div></div>
  <div class="card"><div class="label">Clientes Activos</div><div class="value">${stats.clientesActivos.toLocaleString()}</div></div>
  <div class="card"><div class="label">Citas del Período</div><div class="value">${stats.citasDelPeriodo}</div><div class="change">${stats.citasChange} vs período anterior</div></div>
  <div class="card"><div class="label">Servicios Completados</div><div class="value">${stats.serviciosCompletados}</div><div class="change">${stats.serviciosChange} vs período anterior</div></div>
</div>
<h2>Evolución de Ventas</h2>
<table><thead><tr><th>Mes</th><th>Ventas ($)</th><th>Transacciones</th></tr></thead><tbody>
${salesData.map(r => `<tr><td>${r.month}</td><td>$${r.ventas.toLocaleString()}</td><td>${r.servicios}</td></tr>`).join("")}
</tbody></table>
<h2>Top Servicios</h2>
<table><thead><tr><th>#</th><th>Servicio</th><th>Citas</th><th>Ingresos</th></tr></thead><tbody>
${servicesData.map((s, i) => `<tr><td>${i + 1}</td><td>${s.name}</td><td>${s.value}</td><td>$${s.revenue.toLocaleString()}</td></tr>`).join("")}
</tbody></table>
<div class="footer">© ${new Date().getFullYear()} HIGHLIFE SPA & BAR</div>
</body></html>`;
        const blob = new Blob([html], { type: "text/html" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `reporte-dashboard-${new Date().toISOString().split("T")[0]}.html`;
        a.click();
        return "¡Reporte generado! Ábrelo en el navegador e imprime como PDF.";
      },
      error: "Error al generar el reporte",
    }
  );
}