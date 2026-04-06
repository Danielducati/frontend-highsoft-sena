// src/features/dashboard/components/RevenueChart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface RevenueChartProps {
  data: { name: string; value: number; revenue: number }[];
  periodLabel: string;
}

export function RevenueChart({ data, periodLabel }: RevenueChartProps) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <div className="w-1 h-6 bg-blue-500 rounded-full" />
          Ingresos por Servicio
        </CardTitle>
        <CardDescription>Rentabilidad por servicio — {periodLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-400">Sin datos para este período</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: "12px" }} axisLine={false} tickLine={false} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: "12px" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
              {/* Colores de las barras */}
              <Bar dataKey="revenue" fill=" #1A3A2A" name="Ingresos ($)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
