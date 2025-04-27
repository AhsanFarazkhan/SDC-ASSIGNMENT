import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isIncrease: boolean;
  };
  prefix?: string;
  loading?: boolean;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  prefix = "",
  loading = false 
}: StatsCardProps) {
  return (
    <Card className="bg-white overflow-hidden shadow-sm rounded-lg">
      <CardContent className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
        <dd className="mt-1 text-3xl font-semibold text-gray-900">
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          ) : (
            <span className="font-mono">{prefix}{value}</span>
          )}
        </dd>
        {change && !loading && (
          <div className={`mt-2 flex items-center text-sm ${
            change.isIncrease ? 'text-green-600' : 'text-red-600'
          }`}>
            {change.isIncrease ? (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 mr-1" />
            )}
            <span>{change.value}% {change.isIncrease ? 'increase' : 'decrease'}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
