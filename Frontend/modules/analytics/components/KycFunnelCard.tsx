// modules/analytics/components/KycFunnelCard.tsx
"use client";

import { Users, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import type { KycFunnel } from "../types";

export function KycFunnelCard({
  data,
  loading,
}: {
  data: KycFunnel | undefined;
  loading?: boolean;
}) {
  if (loading || !data) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">KYC Funnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const total = data.total || 0;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">KYC Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <FunnelRow
          icon={Users}
          label="Total Customers"
          value={total}
          percent={100}
          barColor="bg-blue-500"
        />
        <FunnelRow
          icon={Clock}
          label="Pending"
          value={data.pending}
          percent={pct(data.pending)}
          barColor="bg-amber-500"
        />
        <FunnelRow
          icon={CheckCircle2}
          label="Approved"
          value={data.approved}
          percent={pct(data.approved)}
          barColor="bg-emerald-500"
        />
        <FunnelRow
          icon={XCircle}
          label="Rejected"
          value={data.rejected}
          percent={pct(data.rejected)}
          barColor="bg-red-500"
        />
      </CardContent>
    </Card>
  );
}

function FunnelRow({
  icon: Icon,
  label,
  value,
  percent,
  barColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  percent: number;
  barColor: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {label}
        </span>
        <span className="font-medium">
          {formatNumber(value)}{" "}
          <span className="text-xs text-muted-foreground">({percent}%)</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full ${barColor} transition-all`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
