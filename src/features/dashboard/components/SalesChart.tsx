// src/features/dashboard/components/SalesChart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface SalesChartProps {
  data: { month: string; ventas: number; servicios: number }[];
  periodLabel: string;
  period: string;
}

export function SalesChart({ data, periodLabel, period }: SalesChartProps) {

  const formatMoney = (value: number) =>
    `${value.toLocaleString()}`;

  // Determinar el título y descripción según el período
  const getChartInfo = () => {
    switch (period) {
      case "7days":
        return {
          title: "Ventas por Día",
          description: "Comparación diaria de ventas"
        };
      case "30days":
        return {
          title: "Ventas Mensuales",
          description: "Comparación mensual de ventas"
        };
      case "90days":
        return {
          title: "Ventas Semestrales",
          description: "Comparación semestral de ventas"
        };
      case "year":
        return {
          title: "Ventas Anuales",
          description: "Comparación anual de ventas"
        };
      default:
        return {
          title: "Ventas por Período",
          description: "Comparación de ventas"
        };
    }
  };

  const chartInfo = getChartInfo();

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>
          <div className="w-1 h-6 bg-[#78D1BD] rounded-full" />
          {chartInfo.title}
        </CardTitle>

        <CardDescription style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
          {chartInfo.description} — {periodLabel}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
            Sin datos para este período
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                stroke="#9CA3AF"
                style={{ fontSize: "12px", fontFamily: "var(--font-body)" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                stroke="#9CA3AF"
                style={{ fontSize: "12px", fontFamily: "var(--font-body)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value/1000}k`}
              />

              <Tooltip
                formatter={(value: number) => formatMoney(value)}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "none",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  fontSize: "14px",
                  fontFamily: "var(--font-body)"
                }}
              />

              <Bar
                dataKey="ventas"
                radius={[8, 8, 0, 0]}
                name="Ventas"
                animationDuration={800}
              >
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill="#1A3A2A"
                  />
                ))}
              </Bar>

            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}