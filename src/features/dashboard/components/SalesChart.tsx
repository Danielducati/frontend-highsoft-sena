import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SalesChartProps {
  data: { month: string; ventas: number; servicios: number }[];
  periodLabel: string;
}

export function SalesChart({ data, periodLabel }: SalesChartProps) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <div className="w-1 h-6 bg-[#78D1BD] rounded-full" />
          Análisis de Ventas
        </CardTitle>
        <CardDescription>Evolución de ventas mensuales — {periodLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-400">Sin datos para este período</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: "12px" }} axisLine={false} tickLine={false} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: "12px" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
              <Line type="monotone" dataKey="ventas" stroke="#78D1BD" strokeWidth={3} name="Ventas ($)"
                dot={{ fill: "#78D1BD", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}