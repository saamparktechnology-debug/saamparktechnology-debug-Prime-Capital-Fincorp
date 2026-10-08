// modules/analytics/components/LoanFunnelChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import type { LoanFunnelRow } from "../types";

const COLORS: Record<string, string> = {
  Draft: "#94a3b8",
  Applied: "#3b82f6",
  "Under Review": "#8b5cf6",
  Approved: "#06b6d4",
  Disbursed: "#10b981",
  Active: "#059669",
  Completed: "#0d9488",
  Overdue: "#f59e0b",
  Rejected: "#ef4444",
  Cancelled: "#64748b",
};

export function LoanFunnelChart({
  data,
  loading,
}: {
  data: LoanFunnelRow[] | undefined;
  loading?: boolean;
}) {
  const chartData = (data ?? []).map((d) => ({
    status: d.loan_status,
    count: Number(d.count),
    amount: Number(d.amount ?? 0),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Loan Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No loans yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.3}
              />
              <XAxis
                dataKey="status"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                }}
                formatter={(value, name) => {
                  const numericValue = Number(
                    Array.isArray(value) ? value[0] : (value ?? 0),
                  );

                  return name === "amount"
                    ? [formatCurrency(numericValue), "Amount"]
                    : [numericValue, "Count"];
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[entry.status] ?? "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
