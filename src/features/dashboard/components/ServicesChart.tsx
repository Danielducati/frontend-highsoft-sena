//frontend-highsoft-sena\src\features\dashboard\components\ServicesChart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS } from "../constants";

interface ServicesChartProps {
  data: { name: string; value: number; revenue: number }[];
  periodLabel: string;
}

export function ServicesChart({ data, periodLabel }: ServicesChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>
          <div className="w-1 h-6 bg-[#1a5c3a] rounded-full" />
          Distribución de Servicios
        </CardTitle>
        <CardDescription style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
          Top 5 servicios más solicitados — {periodLabel}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
            Sin datos para este período
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {/* Gráfico sin labels inline */}
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} citas (${total > 0 ? ((value / total) * 100).toFixed(0) : 0}%)`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: "0.75rem",
                    border: "none",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                    fontSize: "13px",
                    fontFamily: "var(--font-body)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Leyenda externa con nombre completo y porcentaje */}
            <div className="w-full flex flex-col gap-2">
              {data.map((entry, index) => {
                const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : "0";
                return (
                  <div key={index} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="shrink-0 w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span
                        className="text-sm truncate"
                        style={{ color: "#374151", fontFamily: "var(--font-body)" }}
                        title={entry.name}
                      >
                        {entry.name}
                      </span>
                    </div>
                    <span
                      className="shrink-0 text-sm font-semibold"
                      style={{ color: COLORS[index % COLORS.length] }}
                    >
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
