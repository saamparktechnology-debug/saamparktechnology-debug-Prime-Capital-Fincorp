// modules/dashboard/components/CustomerOverviewDonut.tsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";

const COLORS = {
  approved: "#10b981",
  pending: "#f59e0b",
  rejected: "#ef4444",
};

const LABELS = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

export function CustomerOverviewDonut({
  data,
  loading,
}: {
  data: { approved: number; pending: number; rejected: number } | undefined;
  loading?: boolean;
}) {
  const chartData = data
    ? [
        { name: "approved", value: data.approved, color: COLORS.approved },
        { name: "pending", value: data.pending, color: COLORS.pending },
        { name: "rejected", value: data.rejected, color: COLORS.rejected },
      ].filter((d) => d.value > 0)
    : [];

  const total = data ? data.approved + data.pending + data.rejected : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Customer Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="mx-auto h-64 w-64 rounded-full" />
        ) : total === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No customers yet
          </div>
        ) : (
          <div className="relative">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  stroke="none"
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
                  formatter={(value: any, name: any) => [
                    formatNumber(Number(value ?? 0)),
                    LABELS[name as keyof typeof LABELS] ?? name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center total */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-semibold">
                  {formatNumber(total)}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Total
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-2 grid grid-cols-3 gap-2">
              <LegendItem
                color={COLORS.approved}
                label="Approved"
                value={data!.approved}
              />
              <LegendItem
                color={COLORS.pending}
                label="Pending"
                value={data!.pending}
              />
              <LegendItem
                color={COLORS.rejected}
                label="Rejected"
                value={data!.rejected}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  const pct =
    value === 0 ? "0%" : `${((value / (value + 0.0001)) * 100).toFixed(0)}%`;
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border p-2">
      <div className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-[10px] uppercase text-muted-foreground">
          {label}
        </span>
      </div>
      <span className="text-sm font-semibold">{formatNumber(value)}</span>
    </div>
  );
}
