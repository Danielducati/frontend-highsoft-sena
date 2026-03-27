import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Badge } from "../../../shared/ui/badge";

interface ServicesRankingProps {
  data: { name: string; value: number; revenue: number }[];
  periodLabel: string;
}

export function ServicesRanking({ data, periodLabel }: ServicesRankingProps) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <div className="w-1 h-6 bg-purple-500 rounded-full" />
          Ranking de Servicios
        </CardTitle>
        <CardDescription>Top 5 servicios más rentables — {periodLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Sin datos para este período</p>
        ) : (
          <div className="space-y-3">
            {data.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-sm transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] text-white flex items-center justify-center shadow-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-600">{service.value} citas realizadas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900">${service.revenue.toLocaleString()}</p>
                  <Badge variant="outline" className="mt-1 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                    Ingresos
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}