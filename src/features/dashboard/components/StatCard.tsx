import { Card, CardContent } from "../../../shared/ui/card";
import { LucideIcon } from "lucide-react";
import { ChangeBadge } from "./ChangeBadge";

interface StatCardProps {
  title: string;
  value: string;
  change: string | null;
  icon: LucideIcon;
  color: string;
  periodLabel: string;
}

export function StatCard({ title, value, change, icon: Icon, color, periodLabel }: StatCardProps) {
  return (
    <Card
      className="rounded-2xl shadow-sm border-gray-200 bg-white hover:shadow-md transition-all duration-300"
      style={{ fontFamily: "var(--font-display)" }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change ? <ChangeBadge change={change} /> : <span />}
        </div>
        <div className="space-y-1">
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}
          >
            {title}
          </p>
          <p className="text-3xl font-semibold" style={{ color: "#1a3a2a" }}>
            {value}
          </p>
          <p className="text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
            {periodLabel}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
