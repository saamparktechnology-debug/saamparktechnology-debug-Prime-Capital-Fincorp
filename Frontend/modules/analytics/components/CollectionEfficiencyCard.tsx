// modules/analytics/components/CollectionEfficiencyCard.tsx
"use client";

import { TrendingUp, AlertCircle, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import type { CollectionEfficiency } from "../types";

export function CollectionEfficiencyCard({
  data,
  loading,
}: {
  data: CollectionEfficiency | undefined;
  loading?: boolean;
}) {
  if (loading || !data) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Collection Efficiency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Collection Efficiency</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Big % */}
        <div className="text-center">
          <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
            {data.efficiency}%
          </div>
          <p className="text-xs text-muted-foreground">of dues collected</p>
        </div>

        <Progress value={data.efficiency} className="h-2" />

        {/* Breakdown */}
        <div className="space-y-2 pt-2 text-sm">
          <Row
            icon={Wallet}
            label="Collected"
            value={formatCurrency(data.collected)}
            accent="text-emerald-600 dark:text-emerald-400"
          />
          <Row
            icon={TrendingUp}
            label="Outstanding"
            value={formatCurrency(data.outstanding)}
            accent="text-blue-600 dark:text-blue-400"
          />
          <Row
            icon={AlertCircle}
            label="Overdue"
            value={formatCurrency(data.overdue)}
            accent="text-red-600 dark:text-red-400"
          />
        </div>

        {data.overdueRate > 0 && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-center text-xs text-red-700 dark:text-red-400">
            {data.overdueRate}% of dues are overdue
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${accent}`} />
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
