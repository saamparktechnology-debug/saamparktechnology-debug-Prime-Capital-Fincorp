// modules/analytics/components/CollectionsTrendChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import type { CollectionsTrendRow } from "../types";

export function CollectionsTrendChart({
  data,
  loading,
}: {
  data: CollectionsTrendRow[] | undefined;
  loading?: boolean;
}) {
  const chartData = (data ?? []).map((d) => ({
    month: d.month,
    collected: Number(d.collected ?? 0),
    pending: Number(d.pending ?? 0),
    overdue: Number(d.overdue ?? 0),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Collections Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No collection data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.3}
              />
              <XAxis
                dataKey="month"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (value == null) {
                    return [value, name];
                  }

                  return name === "amount"
                    ? [formatCurrency(Number(value)), "Amount"]
                    : [value, "Count"];
                }}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                }}
              />

              <Legend iconType="line" wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="collected"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Collected"
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Pending"
              />
              <Line
                type="monotone"
                dataKey="overdue"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Overdue"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
