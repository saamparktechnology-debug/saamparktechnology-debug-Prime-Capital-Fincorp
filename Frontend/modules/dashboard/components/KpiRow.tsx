// modules/dashboard/components/KpiRow.tsx
"use client";

import {
  Users,
  Banknote,
  Wallet,
  Landmark,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/format";

interface Kpi {
  label: string;
  value: string;
  hint?: string;
  delta?: number; // percentage or absolute
  icon: LucideIcon;
  accent: "blue" | "emerald" | "violet" | "amber" | "rose";
}

const ACCENTS = {
  blue: {
    icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    ring: "ring-blue-500/10",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/10",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    ring: "ring-violet-500/10",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/10",
  },
  rose: {
    icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    ring: "ring-rose-500/10",
  },
};

export function KpiRow({ kpis, loading }: { kpis: Kpi[]; loading?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {loading
        ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        : kpis.map((kpi, i) => <KpiCard key={i} kpi={kpi} />)}
    </div>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  const a = ACCENTS[kpi.accent];
  const isPositive = (kpi.delta ?? 0) >= 0;

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all hover:shadow-md hover:ring-2",
        a.ring,
      )}
    >
      <CardContent className="relative p-5">
        {/* Decorative corner gradient */}
        <div
          className={cn(
            "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-50",
            a.icon,
          )}
        />

        <div className="relative flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
              a.icon,
            )}
          >
            <Icon className="h-6 w-6" />
          </div>

          {typeof kpi.delta === "number" && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositive ? "+" : ""}
              {kpi.delta}
            </div>
          )}
        </div>

        <div className="relative mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {kpi.label}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            {kpi.value}
          </p>
          {kpi.hint && (
            <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function KpiSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Preset builders ----------
export function buildAdminKpis(summary: {
  customers: { total: number; new_in_period: number };
  kyc: { approved: number; pending: number; rejected: number };
  agents: { total: number; active: number; new_in_period: number };
  banks: { total: number; active: number };
  loans: { total: number; active: number; total_disbursed: number };
  collections: {
    collected_all_time: number;
    collected_in_period: number;
    outstanding: number;
    overdue: number;
  };
}): Kpi[] {
  return [
    {
      label: "Total Customers",
      value: formatNumber(summary.customers.total),
      hint: `${summary.kyc.pending} pending KYC`,
      delta: summary.customers.new_in_period,
      icon: Users,
      accent: "blue",
    },
    {
      label: "Active Loans",
      value: formatNumber(summary.loans.active),
      hint: `${formatCurrency(summary.loans.total_disbursed)} disbursed`,
      icon: Banknote,
      accent: "emerald",
    },
    {
      label: "Total Collected",
      value: formatCurrency(summary.collections.collected_all_time),
      hint: `${formatCurrency(summary.collections.collected_in_period)} this period`,
      icon: Wallet,
      accent: "violet",
    },
    {
      label: "Partner Banks",
      value: formatNumber(summary.banks.total),
      hint: `${summary.banks.active} active`,
      icon: Landmark,
      accent: "amber",
    },
  ];
}
