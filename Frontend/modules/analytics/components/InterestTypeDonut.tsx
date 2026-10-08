// modules/analytics/components/InterestTypeDonut.tsx
"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import type { InterestTypeSplitRow } from "../types";

const COLORS: Record<string, string> = {
  flat: "#3b82f6",
  reducing: "#8b5cf6",
};

export function InterestTypeDonut({
  data,
  loading,
}: {
  data: InterestTypeSplitRow[] | undefined;
  loading?: boolean;
}) {
  const chartData = (data ?? []).map((d) => ({
    name: d.interest_type === "flat" ? "Flat" : "Reducing Balance",
    value: Number(d.count),
    amount: Number(d.total_amount ?? 0),
    color: COLORS[d.interest_type] ?? "#64748b",
  }));

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Interest Type</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="mx-auto h-56 w-56 rounded-full" />
        ) : total === 0 ? (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            No loans yet
          </div>
        ) : (
          <div className="relative">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--popover))",
                    fontSize: 12,
                  }}
                  formatter={(value: any, name: any, item: any) => {
                    const amount = item?.payload?.amount ?? 0;
                    return [`${value} loans • ${formatCurrency(amount)}`, name];
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-10">
              <div className="text-center">
                <div className="text-2xl font-semibold">{total}</div>
                <div className="text-[10px] uppercase text-muted-foreground">
                  Loans
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
