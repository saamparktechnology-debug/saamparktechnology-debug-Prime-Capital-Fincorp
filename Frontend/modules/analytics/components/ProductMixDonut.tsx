// modules/analytics/components/ProductMixDonut.tsx
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
import { formatNumber } from "@/lib/format";
import type { ProductMixRow } from "../types";

export function ProductMixDonut({
  data,
  loading,
}: {
  data: ProductMixRow[] | undefined;
  loading?: boolean;
}) {
  const chartData = (data ?? [])
    .filter((d) => Number(d.count) > 0)
    .map((d) => ({
      name: d.product,
      value: Number(d.count),
      color: d.color,
    }));

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Product Mix</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="mx-auto h-56 w-56 rounded-full" />
        ) : total === 0 ? (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            No applications yet
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
                  formatter={(value: any) => [
                    formatNumber(Number(value ?? 0)),
                    "Applications",
                  ]}
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
                <div className="text-2xl font-semibold">
                  {formatNumber(total)}
                </div>
                <div className="text-[10px] uppercase text-muted-foreground">
                  Total
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
