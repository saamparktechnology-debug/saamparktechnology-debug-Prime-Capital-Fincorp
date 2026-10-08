// modules/dashboard/DashboardPage.tsx
"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import {
  Users as UserIcon,
  Banknote as BanknoteIcon,
  Wallet as WalletIcon,
  TrendingUp as TrendingIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ROLE } from "@/lib/constants/statuses";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { type SelectOption, optionTag } from "@/lib/format";

import {
  useDashboardSummary,
  useRecentLoans,
  useBankBreakdown,
  useAgentPerformanceMini,
  useCollectionsMonthly,
} from "./hooks/useDashboard";
import { KpiRow, buildAdminKpis } from "./components/KpiRow";
import { CustomerOverviewDonut } from "./components/CustomerOverviewDonut";
import { CollectionsTrendBar } from "./components/CollectionsTrendBar";
import { BankListCard } from "./components/BankListCard";
import { RecentLoansCard } from "./components/RecentLoansCard";
import { AgentPerformanceMini } from "./components/AgentPerformanceMini";
import { QuickActionsGrid } from "./components/QuickActionsGrid";

import type { DashboardRange } from "./types";

const RANGE_OPTIONS: SelectOption[] = [
  { value: "today", tag: "Today" },
  { value: "this_month", tag: "This Month" },
  { value: "this_fy", tag: "This Financial Year" },
  { value: "custom", tag: "Custom" },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === ROLE.ADMIN;

  const [range, setRange] = useState<DashboardRange>("this_month");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const summaryQ = useDashboardSummary(range, start, end);
  const recentLoansQ = useRecentLoans(5);
  const banksQ = useBankBreakdown(5);
  const agentsQ = useAgentPerformanceMini(5);
  const collectionsQ = useCollectionsMonthly(6);

  const kpis = isAdmin && summaryQ.data ? buildAdminKpis(summaryQ.data) : [];

  return (
    <div className="space-y-6">
      {/* Header row with date filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold md:text-2xl">Total Overview</h2>
          <p className="text-sm text-muted-foreground">Live business metrics</p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select
            value={range}
            onValueChange={(v) =>
              setRange((v ?? "this_month") as DashboardRange)
            }
          >
            <SelectTrigger className="w-[180px]">
              <span>{optionTag(RANGE_OPTIONS, range) ?? "This Month"}</span>
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {range === "custom" && (
            <>
              <Input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-[150px]"
              />
              <Input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-[150px]"
              />
            </>
          )}
        </div>
      </div>

      {/* KPI Row */}
      {isAdmin ? (
        <KpiRow kpis={kpis} loading={summaryQ.isLoading} />
      ) : (
        <KpiRow
          kpis={
            summaryQ.data
              ? [
                  {
                    label: "My Customers",
                    value: String(summaryQ.data.customers.total),
                    hint: `${summaryQ.data.kyc.pending} pending KYC`,
                    icon: UserIcon,
                    accent: "blue",
                  },
                  {
                    label: "My Loans",
                    value: String(summaryQ.data.loans.total),
                    hint: `${summaryQ.data.loans.active} active`,
                    icon: BanknoteIcon,
                    accent: "emerald",
                  },
                  {
                    label: "My Collected",
                    value: `₹${Number(summaryQ.data.collections.collected_all_time).toLocaleString("en-IN")}`,
                    hint: `₹${Number(summaryQ.data.collections.collected_in_period).toLocaleString("en-IN")} this period`,
                    icon: WalletIcon,
                    accent: "violet",
                  },
                  {
                    label: "Outstanding",
                    value: `₹${Number(summaryQ.data.collections.outstanding).toLocaleString("en-IN")}`,
                    hint: "Portfolio balance",
                    icon: TrendingIcon,
                    accent: "amber",
                  },
                ]
              : []
          }
          loading={summaryQ.isLoading}
        />
      )}

      {/* Charts row: donut + bar + bank list */}
      <div className="grid gap-4 lg:grid-cols-3">
        <CustomerOverviewDonut
          data={summaryQ.data?.kyc}
          loading={summaryQ.isLoading}
        />
        <CollectionsTrendBar
          data={collectionsQ.data}
          loading={collectionsQ.isLoading}
        />
        <BankListCard data={banksQ.data} loading={banksQ.isLoading} />
      </div>

      {/* Bottom row: recent loans + agent performance + quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <RecentLoansCard
          data={recentLoansQ.data}
          loading={recentLoansQ.isLoading}
        />
        {isAdmin && (
          <AgentPerformanceMini
            data={agentsQ.data}
            loading={agentsQ.isLoading}
          />
        )}
        <QuickActionsGrid isAdmin={isAdmin} />
      </div>
    </div>
  );
}
