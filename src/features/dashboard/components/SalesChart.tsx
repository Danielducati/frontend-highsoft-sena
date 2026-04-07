// src/features/dashboard/components/SalesChart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface SalesChartProps {
  data: { month: string; ventas: number; servicios: number }[];
  periodLabel: string;
}

export function SalesChart({ data, periodLabel }: SalesChartProps) {

  const formatMoney = (value: number) =>
    `$${value.toLocaleString()}`;

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <div className="w-1 h-6 bg-[#78D1BD] rounded-full" />
          Ventas por Mes
        </CardTitle>

        <CardDescription>
          Comparación mensual de ventas — {periodLabel}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
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
                style={{ fontSize: "12px" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                stroke="#9CA3AF"
                style={{ fontSize: "12px" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value/1000}k`}
              />

              <Tooltip
                formatter={(value: number) => formatMoney(value)}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "none",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  fontSize: "14px"
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