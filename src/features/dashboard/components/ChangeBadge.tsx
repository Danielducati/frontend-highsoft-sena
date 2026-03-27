import { Badge } from "../../../shared/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";

interface ChangeBadgeProps {
  change: string;
}

export function ChangeBadge({ change }: ChangeBadgeProps) {
  const isUp = change.startsWith("+");
  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 text-xs px-2 py-0.5 ${
        isUp
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-red-50 text-red-700 border-red-200"
      }`}
    >
      {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      {change}
    </Badge>
  );
}