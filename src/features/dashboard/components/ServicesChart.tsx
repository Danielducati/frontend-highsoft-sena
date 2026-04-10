//frontend-highsoft-sena\src\features\dashboard\components\ServicesChart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS } from "../constants";

interface ServicesChartProps {
  data: { name: string; value: number; revenue: number }[];
  periodLabel: string;
}

export function ServicesChart({ data, periodLabel }: ServicesChartProps) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>
          <div className="w-1 h-6 bg-[#A78BFA] rounded-full" />
          Distribución de Servicios
        </CardTitle>
        <CardDescription style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>Top 5 servicios más solicitados — {periodLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>Sin datos para este período</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                innerRadius={55} outerRadius={95} dataKey="value">
                {data.map((_, index) => (
                  // Colores de cada parte del pastel estan en el archivo de constants.ts
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "0 8px 20px rgba(0,0,0,0.08)", fontSize: "14px", fontFamily: "var(--font-body)" }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
