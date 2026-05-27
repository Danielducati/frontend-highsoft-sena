// dashboard/utils/index.ts
// @ts-ignore
import XLSXStyle from "xlsx-js-style";
import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { DashboardData } from "../types";
import { PERIOD_OPTIONS } from "../constants";

export function getPeriodLabel(period: string): string {
  return PERIOD_OPTIONS.find(o => o.value === period)?.label ?? "Período seleccionado";
}

// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  primary:   "1A3A2A",  // Verde oscuro principal
  secondary: "2A5A40",  // Verde medio
  accent:    "EDF7F4",  // Verde muy claro
  gold:      "D4AF37",  // Dorado para acentos
  rowAlt:    "F0FAF6",  // Fila alternada
  white:     "FFFFFF",
  dark:      "1F2937",
  mid:       "6B7280",
  border:    "E5E7EB",
  lightGreen: "78D1BD", // Verde claro para gráficos
};

// RGB arrays para jsPDF [r, g, b]
const RGB = {
  primary:   [26,  58, 42],
  secondary: [42,  90, 64],
  accent:    [237, 247, 244],
  rowAlt:    [240, 250, 246],
  white:     [255, 255, 255],
  dark:      [31,  41, 55],
  mid:       [107, 114, 128],
  border:    [229, 231, 235],
};

// ── Helpers Excel ─────────────────────────────────────────────────────────────
const baseFont = { name: "Calibri" };

const S = {
  // Header principal con logo
  mainHeader: {
    font: { bold: true, color: { rgb: C.gold }, sz: 18, ...baseFont },
    fill: { fgColor: { rgb: C.primary }, patternType: "solid" },
    alignment: { horizontal: "left", vertical: "center" },
  },
  // Subtítulo del header
  headerSubtitle: {
    font: { bold: true, color: { rgb: C.white }, sz: 11, ...baseFont },
    fill: { fgColor: { rgb: C.primary }, patternType: "solid" },
    alignment: { horizontal: "left", vertical: "center" },
  },
  // Info de período y fecha (derecha del header)
  headerInfo: {
    font: { bold: false, color: { rgb: C.white }, sz: 9, ...baseFont },
    fill: { fgColor: { rgb: C.primary }, patternType: "solid" },
    alignment: { horizontal: "left", vertical: "center" },
  },
  // Título de sección con icono
  sectionTitle: {
    font: { bold: true, color: { rgb: C.white }, sz: 12, ...baseFont },
    fill: { fgColor: { rgb: C.primary }, patternType: "solid" },
    alignment: { horizontal: "left", vertical: "center" },
  },
  // Subtítulo de sección
  sectionSubtitle: {
    font: { bold: false, color: { rgb: C.white }, sz: 10, ...baseFont },
    fill: { fgColor: { rgb: C.secondary }, patternType: "solid" },
    alignment: { horizontal: "left", vertical: "center" },
  },
  // Header de columna
  colHeader: {
    font: { bold: true, color: { rgb: C.white }, sz: 10, ...baseFont },
    fill: { fgColor: { rgb: C.primary }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: { 
      top: { style: "thin", color: { rgb: C.primary } }, 
      bottom: { style: "thin", color: { rgb: C.primary } }, 
      left: { style: "thin", color: { rgb: C.primary } }, 
      right: { style: "thin", color: { rgb: C.primary } } 
    },
  },
  // Fila de totales
  totalRow: {
    font: { bold: true, color: { rgb: C.white }, sz: 10, ...baseFont },
    fill: { fgColor: { rgb: C.secondary }, patternType: "solid" },
    alignment: { horizontal: "right", vertical: "center" },
    border: { 
      top: { style: "medium", color: { rgb: C.secondary } }, 
      bottom: { style: "medium", color: { rgb: C.secondary } }, 
      left: { style: "thin", color: { rgb: C.secondary } }, 
      right: { style: "thin", color: { rgb: C.secondary } } 
    },
  },
  // Estilo para KPI cards
  kpiLabel: {
    font: { bold: true, color: { rgb: C.dark }, sz: 9, ...baseFont },
    fill: { fgColor: { rgb: C.accent }, patternType: "solid" },
    alignment: { horizontal: "left", vertical: "center" },
    border: { 
      top: { style: "thin", color: { rgb: C.border } }, 
      bottom: { style: "thin", color: { rgb: C.border } }, 
      left: { style: "medium", color: { rgb: C.primary } }, 
      right: { style: "thin", color: { rgb: C.border } } 
    },
  },
  kpiValue: {
    font: { bold: true, color: { rgb: C.primary }, sz: 14, ...baseFont },
    fill: { fgColor: { rgb: C.white }, patternType: "solid" },
    alignment: { horizontal: "right", vertical: "center" },
    border: { 
      top: { style: "thin", color: { rgb: C.border } }, 
      bottom: { style: "thin", color: { rgb: C.border } }, 
      left: { style: "thin", color: { rgb: C.border } }, 
      right: { style: "thin", color: { rgb: C.border } } 
    },
  },
  kpiChange: {
    font: { bold: false, color: { rgb: C.secondary }, sz: 9, ...baseFont },
    fill: { fgColor: { rgb: C.white }, patternType: "solid" },
    alignment: { horizontal: "right", vertical: "center" },
    border: { 
      top: { style: "thin", color: { rgb: C.border } }, 
      bottom: { style: "thin", color: { rgb: C.border } }, 
      left: { style: "thin", color: { rgb: C.border } }, 
      right: { style: "thin", color: { rgb: C.border } } 
    },
  },
};

function dataStyle(even: boolean, bold = false, align: "left"|"right"|"center" = "left"): object {
  return {
    font: { bold, color: { rgb: C.dark }, sz: 10, ...baseFont },
    fill: { fgColor: { rgb: even ? C.rowAlt : C.white }, patternType: "solid" },
    alignment: { horizontal: align, vertical: "center" },
    border: { top: { style: "hair", color: { rgb: C.border } }, bottom: { style: "hair", color: { rgb: C.border } }, left: { style: "hair", color: { rgb: C.border } }, right: { style: "hair", color: { rgb: C.border } } },
  };
}

function xc(ws: Record<string, unknown>, r: number, c: number, v: string | number, s: object, z?: string) {
  const t = typeof v === "number" ? "n" : "s";
  ws[XLSXStyle.utils.encode_cell({ r, c })] = z ? { v, t, s, z } : { v, t, s };
}

function merge(ws: Record<string, unknown>, r: number, c0: number, c1: number, v: string, s: object) {
  xc(ws, r, c0, v, s);
  if (!ws["!merges"]) ws["!merges"] = [];
  (ws["!merges"] as object[]).push({ s: { r, c: c0 }, e: { r, c: c1 } });
}

function blank(ws: Record<string, unknown>, r: number, cols: number) {
  for (let c = 0; c < cols; c++) xc(ws, r, c, "", { fill: { fgColor: { rgb: C.white }, patternType: "solid" } });
}

// ── EXCEL ─────────────────────────────────────────────────────────────────────
export function exportDashboardReport(data: DashboardData, period: string, periodLabel: string) {
  toast.promise(
    new Promise<void>((resolve, reject) => {
      try {
        const { stats, salesData, servicesData, cancelRate, upcomingAppointments } = data;
        const wb  = XLSXStyle.utils.book_new();
        const now = new Date();
        const dateStr = now.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });

        // ── HOJA 1: DASHBOARD PRINCIPAL ──────────────────────────────────
        const ws1: Record<string, unknown> = {};
        let r = 0; 
        const COLS = 13; // A-M (13 columnas)

        // ═══ HEADER PRINCIPAL (filas 0-2) ═══
        // Fila 0: Logo y título
        xc(ws1, r, 0, "🌿", { ...S.mainHeader, alignment: { horizontal: "center", vertical: "center" } });
        merge(ws1, r, 1, 5, "HIGHLIFE SPA & BAR", S.mainHeader);
        
        // Columnas de período y fecha generada (derecha)
        merge(ws1, r, 7, 8, "PERÍODO", { ...S.headerInfo, alignment: { horizontal: "center", vertical: "center" } });
        merge(ws1, r, 10, 11, "GENERADO", { ...S.headerInfo, alignment: { horizontal: "center", vertical: "center" } });
        r++;

        // Fila 1: Subtítulo
        merge(ws1, r, 1, 5, "REPORTE DASHBOARD", S.headerSubtitle);
        merge(ws1, r, 7, 8, periodLabel, { ...S.headerInfo, font: { bold: true, color: { rgb: C.white }, sz: 10, ...baseFont }, alignment: { horizontal: "center", vertical: "center" } });
        merge(ws1, r, 10, 11, dateStr, { ...S.headerInfo, font: { bold: true, color: { rgb: C.white }, sz: 10, ...baseFont }, alignment: { horizontal: "center", vertical: "center" } });
        r++;

        // Fila 2: Espacio
        blank(ws1, r++, COLS);

        // ═══ SECCIÓN: INDICADORES CLAVE (KPIs) ═══
        merge(ws1, r++, 0, COLS-1, "📊  INDICADORES CLAVE (KPIs)", S.sectionTitle);
        
        // Headers de columnas para KPIs
        xc(ws1, r, 0, "INDICADOR", S.colHeader);
        xc(ws1, r, 1, "VALOR", S.colHeader);
        xc(ws1, r, 2, "CAMBIO VS. PERÍODO ANTERIOR", S.colHeader);
        for (let c = 3; c < COLS; c++) xc(ws1, r, c, "", S.colHeader);
        r++;

        // Solo campos que el backend realmente devuelve
        const kpis: [string, number | string, string][] = [
          ["💰 Ingresos Totales",   stats.ventasTotales,    stats.ventasChange],
          ["👥 Clientes Activos",   stats.clientesActivos,  "—"],
          ["📅 Citas del Período",  stats.citasDelPeriodo,  stats.citasChange],
          ["✅ Ventas Completadas", stats.ventasCompletadas, stats.ventasCountChange],
        ];
        if (cancelRate) {
          kpis.push(["❌ Tasa de Cancelación", cancelRate.rate, `${cancelRate.cancelled} de ${cancelRate.total} citas`]);
        }

        kpis.forEach(([label, val, change], i) => {
          const ev = i % 2 === 0;
          xc(ws1, r, 0, label, S.kpiLabel);
          const isNum = typeof val === "number";
          xc(ws1, r, 1, val, S.kpiValue, isNum && i === 0 ? '"$"#,##0' : isNum ? "#,##0" : undefined);
          xc(ws1, r, 2, change, S.kpiChange);
          for (let c = 3; c < COLS; c++) xc(ws1, r, c, "", dataStyle(ev));
          r++;
        });

        blank(ws1, r++, COLS);

        // ═══ SECCIÓN: EVOLUCIÓN DE VENTAS ═══
        merge(ws1, r++, 0, COLS-1, "📈  EVOLUCIÓN DE VENTAS POR PERÍODO", S.sectionTitle);
        
        // Headers
        xc(ws1, r, 0, "MES / PERÍODO", S.colHeader);
        xc(ws1, r, 1, "INGRESOS ($)", S.colHeader);
        xc(ws1, r, 2, "N° TRANSACCIONES", S.colHeader);
        for (let c = 3; c < COLS; c++) xc(ws1, r, c, "", S.colHeader);
        r++;

        salesData.forEach((row, i) => {
          const ev = i % 2 === 0;
          xc(ws1, r, 0, row.month,     dataStyle(ev, false, "left"));
          xc(ws1, r, 1, row.ventas,    dataStyle(ev, false, "right"), '"$"#,##0');
          xc(ws1, r, 2, row.servicios, dataStyle(ev, false, "right"), "#,##0");
          for (let c = 3; c < COLS; c++) xc(ws1, r, c, "", dataStyle(ev));
          r++;
        });

        const totV = salesData.reduce((s, d) => s + d.ventas, 0);
        const totT = salesData.reduce((s, d) => s + d.servicios, 0);
        xc(ws1, r, 0, "TOTAL", S.totalRow);
        xc(ws1, r, 1, totV,   { ...S.totalRow }, '"$"#,##0');
        xc(ws1, r, 2, totT,   { ...S.totalRow }, "#,##0");
        for (let c = 3; c < COLS; c++) xc(ws1, r, c, "", S.totalRow);
        r++;

        blank(ws1, r++, COLS);

        // ═══ SECCIÓN: DISTRIBUCIÓN DE SERVICIOS (Top 5) ═══
        merge(ws1, r++, 0, COLS-1, "🎯  DISTRIBUCIÓN DE SERVICIOS", S.sectionTitle);
        
        // Headers
        xc(ws1, r, 0, "SERVICIO", S.colHeader);
        xc(ws1, r, 1, "N° CITAS", S.colHeader);
        xc(ws1, r, 2, "% DEL TOTAL", S.colHeader);
        xc(ws1, r, 3, "BARRA VISUAL", S.colHeader);
        for (let c = 4; c < COLS; c++) xc(ws1, r, c, "", S.colHeader);
        r++;

        // Top 5 servicios con barra visual
        const top5Services = servicesData.slice(0, 5);
        const maxServiceValue = Math.max(...top5Services.map(s => s.value));
        
        top5Services.forEach((svc, i) => {
          const ev = i % 2 === 0;
          const pct = totT > 0 ? ((svc.value / totT) * 100).toFixed(1) : "0";
          const barLength = Math.round((svc.value / maxServiceValue) * 20);
          const bar = "█".repeat(barLength) + "░".repeat(20 - barLength);
          
          xc(ws1, r, 0, svc.name, dataStyle(ev, false, "left"));
          xc(ws1, r, 1, svc.value, dataStyle(ev, false, "right"), "#,##0");
          xc(ws1, r, 2, `${pct}%`, dataStyle(ev, false, "center"));
          merge(ws1, r, 3, 8, bar, { ...dataStyle(ev, false, "left"), font: { ...baseFont, color: { rgb: C.primary }, sz: 10 } });
          for (let c = 9; c < COLS; c++) xc(ws1, r, c, "", dataStyle(ev));
          r++;
        });

        blank(ws1, r++, COLS);

        // ═══ SECCIÓN: INGRESOS POR SERVICIO ═══
        merge(ws1, r++, 0, COLS-1, "💰  INGRESOS POR SERVICIO", S.sectionTitle);
        
        // Headers
        xc(ws1, r, 0, "SERVICIO", S.colHeader);
        xc(ws1, r, 1, "INGRESOS ($)", S.colHeader);
        xc(ws1, r, 2, "% DEL TOTAL", S.colHeader);
        xc(ws1, r, 3, "BARRA VISUAL", S.colHeader);
        for (let c = 4; c < COLS; c++) xc(ws1, r, c, "", S.colHeader);
        r++;

        // Top 5 servicios por ingresos con barra visual
        const totRevenue = servicesData.reduce((s, d) => s + d.revenue, 0);
        const maxRevenue = Math.max(...top5Services.map(s => s.revenue));
        
        top5Services.forEach((svc, i) => {
          const ev = i % 2 === 0;
          const pct = totRevenue > 0 ? ((svc.revenue / totRevenue) * 100).toFixed(1) : "0";
          const barLength = Math.round((svc.revenue / maxRevenue) * 20);
          const bar = "█".repeat(barLength) + "░".repeat(20 - barLength);
          
          xc(ws1, r, 0, svc.name, dataStyle(ev, false, "left"));
          xc(ws1, r, 1, svc.revenue, dataStyle(ev, false, "right"), '"$"#,##0');
          xc(ws1, r, 2, `${pct}%`, dataStyle(ev, false, "center"));
          merge(ws1, r, 3, 8, bar, { ...dataStyle(ev, false, "left"), font: { ...baseFont, color: { rgb: C.lightGreen }, sz: 10 } });
          for (let c = 9; c < COLS; c++) xc(ws1, r, c, "", dataStyle(ev));
          r++;
        });

        blank(ws1, r++, COLS);

        // ═══ SECCIÓN: TASA DE CANCELACIONES ═══
        if (cancelRate) {
          merge(ws1, r++, 0, COLS-1, "📊  TASA DE CANCELACIONES", S.sectionTitle);
          
          // Headers
          xc(ws1, r, 0, "ESTADO", S.colHeader);
          xc(ws1, r, 1, "CANTIDAD", S.colHeader);
          xc(ws1, r, 2, "PORCENTAJE", S.colHeader);
          xc(ws1, r, 3, "BARRA VISUAL", S.colHeader);
          for (let c = 4; c < COLS; c++) xc(ws1, r, c, "", S.colHeader);
          r++;

          const totalCitas = cancelRate.total;
          const completadas = stats.ventasCompletadas;
          const canceladas = cancelRate.cancelled;
          const pendientes = totalCitas - completadas - canceladas;

          const distribucion = [
            ["✅ Completadas / Pendientes", completadas + pendientes, totalCitas > 0 ? `${(((completadas + pendientes) / totalCitas) * 100).toFixed(1)}%` : "0%", C.lightGreen],
            ["❌ Canceladas", canceladas, totalCitas > 0 ? `${((canceladas / totalCitas) * 100).toFixed(1)}%` : "0%", "EF4444"],
          ];

          distribucion.forEach(([estado, cant, pct, color], i) => {
            const ev = i % 2 === 0;
            const cantNum = cant as number;
            const barLength = totalCitas > 0 ? Math.round((cantNum / totalCitas) * 20) : 0;
            const bar = "█".repeat(barLength) + "░".repeat(20 - barLength);
            
            xc(ws1, r, 0, estado as string, dataStyle(ev, true, "left"));
            xc(ws1, r, 1, cantNum, dataStyle(ev, false, "right"), "#,##0");
            xc(ws1, r, 2, pct as string, dataStyle(ev, false, "center"));
            merge(ws1, r, 3, 8, bar, { ...dataStyle(ev, false, "left"), font: { ...baseFont, color: { rgb: color as string }, sz: 10 } });
            for (let c = 9; c < COLS; c++) xc(ws1, r, c, "", dataStyle(ev));
            r++;
          });

          // Resumen
          xc(ws1, r, 0, "TOTAL CITAS", S.totalRow);
          xc(ws1, r, 1, totalCitas, { ...S.totalRow }, "#,##0");
          xc(ws1, r, 2, "100%", { ...S.totalRow, alignment: { horizontal: "center", vertical: "center" } });
          merge(ws1, r, 3, 8, `Tasa de cancelación: ${cancelRate.rate}`, { ...S.totalRow, alignment: { horizontal: "left", vertical: "center" } });
          for (let c = 9; c < COLS; c++) xc(ws1, r, c, "", S.totalRow);
          r++;

          blank(ws1, r++, COLS);
        }

        // ═══ SECCIÓN: VENTAS MENSUALES (Gráfico de barras) ═══
        merge(ws1, r++, 0, COLS-1, "📈  VENTAS MENSUALES - COMPARACIÓN", S.sectionTitle);
        
        // Headers
        xc(ws1, r, 0, "MES", S.colHeader);
        xc(ws1, r, 1, "INGRESOS ($)", S.colHeader);
        xc(ws1, r, 2, "N° TRANSACCIONES", S.colHeader);
        xc(ws1, r, 3, "GRÁFICO INGRESOS", S.colHeader);
        for (let c = 4; c < COLS; c++) xc(ws1, r, c, "", S.colHeader);
        r++;

        const maxVentas = Math.max(...salesData.map(s => s.ventas));

        salesData.forEach((row, i) => {
          const ev = i % 2 === 0;
          const barLengthVentas = Math.round((row.ventas / maxVentas) * 20);
          const barVentas = "█".repeat(barLengthVentas) + "░".repeat(20 - barLengthVentas);
          
          xc(ws1, r, 0, row.month, dataStyle(ev, false, "left"));
          xc(ws1, r, 1, row.ventas, dataStyle(ev, false, "right"), '"$"#,##0');
          xc(ws1, r, 2, row.servicios, dataStyle(ev, false, "right"), "#,##0");
          merge(ws1, r, 3, 8, barVentas, { ...dataStyle(ev, false, "left"), font: { ...baseFont, color: { rgb: C.primary }, sz: 10 } });
          for (let c = 9; c < COLS; c++) xc(ws1, r, c, "", dataStyle(ev));
          r++;
        });

        blank(ws1, r++, COLS);

        // Configuración de columnas y filas
        ws1["!cols"] = [
          { wch: 22 }, // A - Indicador/Label
          { wch: 14 }, // B - Valor
          { wch: 24 }, // C - Cambio/Transacciones
          { wch: 10 }, // D
          { wch: 10 }, // E
          { wch: 10 }, // F
          { wch: 10 }, // G
          { wch: 10 }, // H
          { wch: 10 }, // I
          { wch: 10 }, // J
          { wch: 10 }, // K
          { wch: 10 }, // L
          { wch: 10 }, // M
        ];
        ws1["!rows"] = [
          { hpt: 30 }, // Fila 0: Header con logo
          { hpt: 22 }, // Fila 1: Subtítulo
          { hpt: 8 },  // Fila 2: Espacio
        ];
        
        ws1["!ref"] = XLSXStyle.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r-1, c: COLS-1 } });
        XLSXStyle.utils.book_append_sheet(wb, ws1, "Dashboard");

        // ── HOJA 2: TOP SERVICIOS ─────────────────────────────────────────
        const ws2: Record<string, unknown> = {};
        let r2 = 0; const N2 = 5;
        const totRev   = servicesData.reduce((s, d) => s + d.revenue, 0);
        const totCitas = servicesData.reduce((s, d) => s + d.value, 0);

        merge(ws2, r2++, 0, N2-1, `🏆  Top Servicios — ${periodLabel}`, S.sectionTitle);
        ["#", "Servicio", "N° Citas", "Ingresos ($)", "% del Total"].forEach((h, c) => xc(ws2, r2, c, h, S.colHeader));
        r2++;

        servicesData.forEach((svc, i) => {
          const ev  = i % 2 === 0;
          const pct = totRev > 0 ? `${((svc.revenue / totRev) * 100).toFixed(1)}%` : "0%";
          xc(ws2, r2, 0, i + 1,      dataStyle(ev, false, "center"), "#,##0");
          xc(ws2, r2, 1, svc.name,   dataStyle(ev, false, "left"));
          xc(ws2, r2, 2, svc.value,  dataStyle(ev, false, "right"), "#,##0");
          xc(ws2, r2, 3, svc.revenue, dataStyle(ev, false, "right"), '"$"#,##0');
          xc(ws2, r2, 4, pct,        dataStyle(ev, false, "center"));
          r2++;
        });

        xc(ws2, r2, 0, "",       S.totalRow);
        xc(ws2, r2, 1, "TOTAL",  { ...S.totalRow, alignment: { horizontal: "left", vertical: "center" } });
        xc(ws2, r2, 2, totCitas, { ...S.totalRow }, "#,##0");
        xc(ws2, r2, 3, totRev,   { ...S.totalRow }, '"$"#,##0');
        xc(ws2, r2, 4, "100%",   { ...S.totalRow, alignment: { horizontal: "center", vertical: "center" } });
        r2++;

        ws2["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 12 }, { wch: 16 }, { wch: 12 }];
        ws2["!ref"]  = XLSXStyle.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r2-1, c: N2-1 } });
        XLSXStyle.utils.book_append_sheet(wb, ws2, "Top Servicios");

        // ── HOJA 3: PRÓXIMAS CITAS ────────────────────────────────────────
        if (upcomingAppointments && upcomingAppointments.length > 0) {
          const ws3: Record<string, unknown> = {};
          let r3 = 0; const N3 = 6;

          merge(ws3, r3++, 0, N3-1, "📅  Próximas Citas", S.sectionTitle);
          ["Fecha", "Hora", "Cliente", "Empleado", "Servicio", "Estado"].forEach((h, c) => xc(ws3, r3, c, h, S.colHeader));
          r3++;

          upcomingAppointments.forEach((a, i) => {
            const ev = i % 2 === 0;
            xc(ws3, r3, 0, a.fecha,        dataStyle(ev));
            xc(ws3, r3, 1, a.hora,         dataStyle(ev, false, "center"));
            xc(ws3, r3, 2, a.clienteName,  dataStyle(ev));
            xc(ws3, r3, 3, a.employeeName, dataStyle(ev));
            xc(ws3, r3, 4, a.serviceName,  dataStyle(ev));
            xc(ws3, r3, 5, a.estado,       dataStyle(ev, false, "center"));
            r3++;
          });

          ws3["!cols"] = [{ wch: 13 }, { wch: 9 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 13 }];
          ws3["!ref"]  = XLSXStyle.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r3-1, c: N3-1 } });
          XLSXStyle.utils.book_append_sheet(wb, ws3, "Próximas Citas");
        }

        XLSXStyle.writeFile(wb, `reporte-highlife-${period}-${now.toISOString().split("T")[0]}.xlsx`);
        resolve();
      } catch (err) { reject(err); }
    }),
    { loading: "Generando Excel...", success: "¡Excel descargado!", error: "Error al generar el Excel" }
  );
}

// ── PDF con jsPDF ─────────────────────────────────────────────────────────────
export function exportDashboardPDF(data: DashboardData, period: string, periodLabel: string) {
  try {
    const { stats, salesData, servicesData, cancelRate, upcomingAppointments } = data;
    const now     = new Date();
    const dateStr = now.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
    const totV    = salesData.reduce((s, d) => s + d.ventas, 0);
    const totT    = salesData.reduce((s, d) => s + d.servicios, 0);
    const totRev  = servicesData.reduce((s, d) => s + d.revenue, 0);
    const totC    = servicesData.reduce((s, d) => s + d.value, 0);

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W   = doc.internal.pageSize.getWidth();
    let y     = 0;

    // ── Header ──────────────────────────────────────────────────────────
    doc.setFillColor(...(RGB.primary as [number,number,number]));
    doc.rect(0, 0, W, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("HIGHLIFE SPA & BAR", 14, 12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(167, 196, 181);
    doc.text(`Reporte Dashboard  ·  ${periodLabel}  ·  ${dateStr}`, 14, 21);
    y = 36;

    // ── KPI cards (2 columnas) ───────────────────────────────────────────
    const kpis = [
      { label: "Ingresos Totales",   value: `$${stats.ventasTotales.toLocaleString("es-CO")}`,  change: stats.ventasChange },
      { label: "Clientes Activos",   value: `${stats.clientesActivos}`,                          change: "" },
      { label: "Citas del Período",  value: `${stats.citasDelPeriodo}`,                          change: stats.citasChange },
      { label: "Ventas Completadas", value: `${stats.ventasCompletadas}`,                        change: stats.ventasCountChange },
      ...(cancelRate ? [{ label: "Tasa de Cancelación", value: cancelRate.rate, change: `${cancelRate.cancelled} de ${cancelRate.total} citas` }] : []),
    ];

    const cardW = (W - 28 - 6) / 2;
    const cardH = 18;
    kpis.forEach((k, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x   = 14 + col * (cardW + 6);
      const cy  = y + row * (cardH + 4);

      // Fondo
      doc.setFillColor(...(RGB.accent as [number,number,number]));
      doc.roundedRect(x, cy, cardW, cardH, 2, 2, "F");
      // Borde izquierdo verde
      doc.setFillColor(...(RGB.primary as [number,number,number]));
      doc.rect(x, cy, 2.5, cardH, "F");

      doc.setTextColor(...(RGB.mid as [number,number,number]));
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(k.label.toUpperCase(), x + 6, cy + 5.5);

      doc.setTextColor(...(RGB.primary as [number,number,number]));
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(k.value, x + 6, cy + 12);

      if (k.change) {
        doc.setTextColor(...(RGB.secondary as [number,number,number]));
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(k.change, x + cardW - 4, cy + 12, { align: "right" });
      }
    });

    y += Math.ceil(kpis.length / 2) * (cardH + 4) + 6;

    // ── Helper: sección título ───────────────────────────────────────────
    const sectionTitle = (title: string) => {
      doc.setFillColor(...(RGB.primary as [number,number,number]));
      doc.rect(14, y, W - 28, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(title, 18, y + 5);
      y += 7;
    };

    // ── Tabla: Evolución de ventas ───────────────────────────────────────
    sectionTitle("Evolución de Ventas por Período");
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [["Mes / Período", "Ingresos ($)", "N° Transacciones"]],
      body: [
        ...salesData.map(r => [r.month, `$${r.ventas.toLocaleString("es-CO")}`, r.servicios.toString()]),
        ["TOTAL", `$${totV.toLocaleString("es-CO")}`, totT.toString()],
      ],
      headStyles:  { fillColor: RGB.secondary, textColor: [255,255,255], fontStyle: "bold", fontSize: 9 },
      bodyStyles:  { fontSize: 9, textColor: RGB.dark },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
      alternateRowStyles: { fillColor: RGB.rowAlt },
      didParseCell: (d: any) => {
        if (d.row.index === salesData.length) {
          d.cell.styles.fillColor = RGB.secondary;
          d.cell.styles.textColor = [255, 255, 255];
          d.cell.styles.fontStyle = "bold";
        }
      },
      theme: "plain",
    });
    y = (doc as any).lastAutoTable.finalY + 6;

    // ── Tabla: Top Servicios ─────────────────────────────────────────────
    sectionTitle("Top Servicios");
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [["#", "Servicio", "N° Citas", "Ingresos ($)", "% del Total"]],
      body: [
        ...servicesData.map((s, i) => [
          (i + 1).toString(), s.name, s.value.toString(),
          `$${s.revenue.toLocaleString("es-CO")}`,
          totRev > 0 ? `${((s.revenue / totRev) * 100).toFixed(1)}%` : "0%",
        ]),
        ["", "TOTAL", totC.toString(), `$${totRev.toLocaleString("es-CO")}`, "100%"],
      ],
      headStyles:  { fillColor: RGB.secondary, textColor: [255,255,255], fontStyle: "bold", fontSize: 9 },
      bodyStyles:  { fontSize: 9, textColor: RGB.dark },
      columnStyles: { 0: { halign: "center", cellWidth: 10 }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } },
      alternateRowStyles: { fillColor: RGB.rowAlt },
      didParseCell: (d: any) => {
        if (d.row.index === servicesData.length) {
          d.cell.styles.fillColor = RGB.secondary;
          d.cell.styles.textColor = [255, 255, 255];
          d.cell.styles.fontStyle = "bold";
        }
      },
      theme: "plain",
    });
    y = (doc as any).lastAutoTable.finalY + 6;

    // ── Tabla: Próximas Citas ────────────────────────────────────────────
    if (upcomingAppointments && upcomingAppointments.length > 0) {
      if (y > 220) { doc.addPage(); y = 14; }
      sectionTitle("Próximas Citas");
      autoTable(doc, {
        startY: y,
        margin: { left: 14, right: 14 },
        head: [["Fecha", "Hora", "Cliente", "Empleado", "Servicio", "Estado"]],
        body: upcomingAppointments.map(a => [a.fecha, a.hora, a.clienteName, a.employeeName, a.serviceName, a.estado]),
        headStyles:  { fillColor: RGB.secondary, textColor: [255,255,255], fontStyle: "bold", fontSize: 8 },
        bodyStyles:  { fontSize: 8, textColor: RGB.dark },
        alternateRowStyles: { fillColor: RGB.rowAlt },
        theme: "plain",
      });
      y = (doc as any).lastAutoTable.finalY + 6;
    }

    // ── Footer ───────────────────────────────────────────────────────────
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(...(RGB.accent as [number,number,number]));
    doc.rect(0, pageH - 10, W, 10, "F");
    doc.setTextColor(...(RGB.mid as [number,number,number]));
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`© ${now.getFullYear()} HIGHLIFE SPA & BAR — Documento generado automáticamente`, W / 2, pageH - 4, { align: "center" });

    doc.save(`reporte-highlife-${period}-${now.toISOString().split("T")[0]}.pdf`);
    toast.success("¡PDF descargado correctamente!");
  } catch (err) {
    console.error("Error PDF:", err);
    toast.error("Error al generar el PDF");
  }
}
