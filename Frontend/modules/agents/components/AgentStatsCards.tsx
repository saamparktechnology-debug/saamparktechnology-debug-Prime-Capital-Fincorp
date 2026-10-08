// modules/agents/components/AgentStatsCards.tsx
"use client";

import { Users, Banknote, Wallet, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from "@/lib/format";

interface Stat {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent: "blue" | "emerald" | "violet" | "amber";
}

const ACCENTS = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function AgentStatsCards({
  stats,
  loading,
}: {
  stats: Stat[] | null;
  loading?: boolean;
}) {
  if (loading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-5">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.label} className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${ACCENTS[s.accent]}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
                <p className="mt-1 truncate text-2xl font-semibold">
                  {s.value}
                </p>
                {s.hint && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {s.hint}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ---- Helper to build stats from summary data ----
export function buildAgentStats(
  summary:
    | {
        profile: any;
        metrics: {
          customers: Array<{ kyc_status: string; count: number }>;
          loans: Array<{
            loan_status: string;
            count: number;
            total_amount: number;
          }>;
          collections: Array<{
            status: string;
            count: number;
            total_amount: number;
          }>;
        };
      }
    | undefined,
): Stat[] | null {
  if (!summary) return null;

  const totalCustomers = summary.metrics.customers.reduce(
    (s, c) => s + Number(c.count),
    0,
  );
  const approvedKyc =
    summary.metrics.customers.find((c) => c.kyc_status === "approved")?.count ??
    0;
  const pendingKyc =
    summary.metrics.customers.find((c) => c.kyc_status === "pending")?.count ??
    0;

  const totalLoans = summary.metrics.loans.reduce(
    (s, l) => s + Number(l.count),
    0,
  );
  const portfolioValue = summary.metrics.loans
    .filter((l) => l.loan_status === "Active" || l.loan_status === "Disbursed")
    .reduce((s, l) => s + Number(l.total_amount ?? 0), 0);

  const totalCollected = summary.metrics.collections
    .filter((c) => c.status === "Paid")
    .reduce((s, c) => s + Number(c.total_amount ?? 0), 0);

  return [
    {
      label: "Total Customers",
      value: formatNumber(totalCustomers),
      hint: `${approvedKyc} approved · ${pendingKyc} pending`,
      icon: Users,
      accent: "blue",
    },
    {
      label: "Total Loans",
      value: formatNumber(totalLoans),
      hint: "Across all statuses",
      icon: Banknote,
      accent: "emerald",
    },
    {
      label: "Portfolio Value",
      value: formatCurrency(portfolioValue),
      hint: "Active + Disbursed",
      icon: Wallet,
      accent: "violet",
    },
    {
      label: "Total Collected",
      value: formatCurrency(totalCollected),
      hint: "EMI payments received",
      icon: CheckCircle2,
      accent: "amber",
    },
  ];
}
