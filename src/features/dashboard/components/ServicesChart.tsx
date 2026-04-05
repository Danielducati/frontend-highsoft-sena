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
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <div className="w-1 h-6 bg-[#A78BFA] rounded-full" />
          Distribución de Servicios
        </CardTitle>
        <CardDescription>Top 5 servicios más solicitados — {periodLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-400">Sin datos para este período</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100} dataKey="value">
                {data.map((_, index) => (
                  // Colores de cada parte del pastel estan en el archivo de constants.ts
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
