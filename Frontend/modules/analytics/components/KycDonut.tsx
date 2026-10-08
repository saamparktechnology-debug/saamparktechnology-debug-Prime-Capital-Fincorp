// modules/analytics/components/KycDonut.tsx
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
import type { CustomerStatusCount } from "../types";

const COLORS: Record<string, string> = {
  approved: "#10b981",
  pending: "#f59e0b",
  rejected: "#ef4444",
};

export function KycDonut({
  data,
  loading,
}: {
  data: CustomerStatusCount[] | undefined;
  loading?: boolean;
}) {
  const chartData = (data ?? []).map((d) => ({
    name: d.kyc_status,
    value: Number(d.count),
    color: COLORS[d.kyc_status] ?? "#64748b",
  }));

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Customer KYC Status</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="mx-auto h-56 w-56 rounded-full" />
        ) : chartData.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            No customer data yet
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
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs capitalize">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-10">
              <div className="text-center">
                <div className="text-2xl font-semibold">{total}</div>
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
