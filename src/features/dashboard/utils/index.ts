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
  primary:   "1A3A2A",
  secondary: "2A5A40",
  accent:    "EDF7F4",
  rowAlt:    "F0FAF6",
  white:     "FFFFFF",
  dark:      "1F2937",
  mid:       "6B7280",
  border:    "E5E7EB",
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
  title: {
    font: { bold: true, color: { rgb: C.white }, sz: 14, ...baseFont },
    fill: { fgColor: { rgb: C.primary }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
  },
  subtitle: {
    font: { italic: true, color: { rgb: C.mid }, sz: 10, ...baseFont },
    fill: { fgColor: { rgb: C.accent }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
  },
  section: {
    font: { bold: true, color: { rgb: C.white }, sz: 11, ...baseFont },
    fill: { fgColor: { rgb: C.secondary }, patternType: "solid" },
    alignment: { horizontal: "left", vertical: "center" },
  },
  colHeader: {
    font: { bold: true, color: { rgb: C.white }, sz: 10, ...baseFont },
    fill: { fgColor: { rgb: C.primary }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: { top: { style: "thin", color: { rgb: C.primary } }, bottom: { style: "thin", color: { rgb: C.primary } }, left: { style: "thin", color: { rgb: C.primary } }, right: { style: "thin", color: { rgb: C.primary } } },
  },
  totalRow: {
    font: { bold: true, color: { rgb: C.white }, sz: 10, ...baseFont },
    fill: { fgColor: { rgb: C.secondary }, patternType: "solid" },
    alignment: { horizontal: "right", vertical: "center" },
    border: { top: { style: "thin", color: { rgb: C.secondary } }, bottom: { style: "thin", color: { rgb: C.secondary } }, left: { style: "thin", color: { rgb: C.secondary } }, right: { style: "thin", color: { rgb: C.secondary } } },
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

        // ── HOJA 1: RESUMEN ───────────────────────────────────────────────
        const ws1: Record<string, unknown> = {};
        let r = 0; const N = 4;

        merge(ws1, r++, 0, N-1, "HIGHLIFE SPA & BAR — Reporte Dashboard", S.title);
        merge(ws1, r++, 0, N-1, `Período: ${periodLabel}   |   Generado: ${dateStr}`, S.subtitle);
        blank(ws1, r++, N);

        // KPIs
        merge(ws1, r++, 0, N-1, "  Indicadores Clave (KPIs)", S.section);
        ["Indicador", "Valor", "Cambio vs período anterior", ""].forEach((h, c) => xc(ws1, r, c, h, S.colHeader));
        r++;

        // Solo campos que el backend realmente devuelve
        const kpis: [string, number | string, string][] = [
          ["Ingresos Totales",   stats.ventasTotales,    stats.ventasChange],
          ["Clientes Activos",   stats.clientesActivos,  "—"],
          ["Citas del Período",  stats.citasDelPeriodo,  stats.citasChange],
          ["Ventas Completadas", stats.ventasCompletadas, stats.ventasCountChange],
        ];
        if (cancelRate) {
          kpis.push(["Tasa de Cancelación", cancelRate.rate, `${cancelRate.cancelled} de ${cancelRate.total} citas`]);
        }

        kpis.forEach(([label, val, change], i) => {
          const ev = i % 2 === 0;
          xc(ws1, r, 0, label, dataStyle(ev, true, "left"));
          const isNum = typeof val === "number";
          xc(ws1, r, 1, val, dataStyle(ev, false, "right"), isNum && i === 0 ? '"$"#,##0' : isNum ? "#,##0" : undefined);
          xc(ws1, r, 2, change, dataStyle(ev, false, "left"));
          xc(ws1, r, 3, "", dataStyle(ev));
          r++;
        });

        blank(ws1, r++, N);

        // Evolución de ventas
        merge(ws1, r++, 0, N-1, "  Evolución de Ventas por Período", S.section);
        ["Mes / Período", "Ingresos ($)", "N° Transacciones", ""].forEach((h, c) => xc(ws1, r, c, h, S.colHeader));
        r++;

        salesData.forEach((row, i) => {
          const ev = i % 2 === 0;
          xc(ws1, r, 0, row.month,     dataStyle(ev, false, "left"));
          xc(ws1, r, 1, row.ventas,    dataStyle(ev, false, "right"), '"$"#,##0');
          xc(ws1, r, 2, row.servicios, dataStyle(ev, false, "right"), "#,##0");
          xc(ws1, r, 3, "",            dataStyle(ev));
          r++;
        });

        const totV = salesData.reduce((s, d) => s + d.ventas, 0);
        const totT = salesData.reduce((s, d) => s + d.servicios, 0);
        xc(ws1, r, 0, "TOTAL", S.totalRow);
        xc(ws1, r, 1, totV,   { ...S.totalRow }, '"$"#,##0');
        xc(ws1, r, 2, totT,   { ...S.totalRow }, "#,##0");
        xc(ws1, r, 3, "",     S.totalRow);
        r++;

        ws1["!cols"] = [{ wch: 28 }, { wch: 16 }, { wch: 26 }, { wch: 2 }];
        ws1["!rows"] = [{ hpt: 26 }, { hpt: 16 }];
        ws1["!ref"]  = XLSXStyle.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r-1, c: N-1 } });
        XLSXStyle.utils.book_append_sheet(wb, ws1, "Resumen General");

        // ── HOJA 2: TOP SERVICIOS ─────────────────────────────────────────
        const ws2: Record<string, unknown> = {};
        let r2 = 0; const N2 = 5;
        const totRev   = servicesData.reduce((s, d) => s + d.revenue, 0);
        const totCitas = servicesData.reduce((s, d) => s + d.value, 0);

        merge(ws2, r2++, 0, N2-1, `  Top Servicios — ${periodLabel}`, S.section);
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

          merge(ws3, r3++, 0, N3-1, "  Próximas Citas", S.section);
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
