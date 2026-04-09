//frontend-highsoft-sena\src\features\dashboard\components\ServicesRanking.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface ServicesRankingProps {
  data: { name: string; value: number; revenue: number }[];
  periodLabel: string;
}

export function ServicesRanking({ data, periodLabel }: ServicesRankingProps) {

  const formatMoney = (value: number) =>
    `$${value.toLocaleString()}`;

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>
          <div className="w-1 h-6 bg-purple-500 rounded-full" />
          Top Servicios
        </CardTitle>

        <CardDescription style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
          Servicios más vendidos — {periodLabel}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <p className="text-center py-8" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
            Sin datos para este período
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ left: 20, right: 20 }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                horizontal={false}
              />

              <XAxis
                type="number"
                stroke="#9CA3AF"
                tickLine={false}
                axisLine={false}
                style={{ fontSize: "12px", fontFamily: "var(--font-body)" }}
              />

              <YAxis
                type="category"
                dataKey="name"
                stroke="#9CA3AF"
                width={150}
                tickLine={false}
                axisLine={false}
                style={{ fontSize: "12px", fontFamily: "var(--font-body)" }}
              />

              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "Ingresos") return formatMoney(value);
                  return value;
                }}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "none",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  fontSize: "14px",
                  fontFamily: "var(--font-body)"
                }}
              />

              <Bar
                dataKey="value"
                fill="#78D1BD"
                radius={[0, 8, 8, 0]}
                name="Servicios vendidos"
              />

            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}