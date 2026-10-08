// modules/dashboard/components/AgentPerformanceMini.tsx
"use client";

import Link from "next/link";
import { ArrowRight, UserCog } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/format";

export function AgentPerformanceMini({
  data,
  loading,
}: {
  data:
    | Array<{
        agent_id: number;
        full_name: string;
        email: string;
        is_active: number;
        total_customers: number;
        total_loans: number;
        portfolio_value: string | number;
      }>
    | undefined;
  loading?: boolean;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Agent Performance</CardTitle>
        <Link
          href="/agents"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          View all
          <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            No agents yet
          </div>
        ) : (
          <ul className="divide-y">
            {data.map((agent) => (
              <li key={agent.agent_id} className="flex items-center gap-3 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <UserCog className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/agents/${agent.agent_id}`}
                    className="truncate text-sm font-medium hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                  >
                    {agent.full_name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {agent.total_customers} customers • {agent.total_loans}{" "}
                    loans
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(agent.portfolio_value)}
                  </p>
                  <Badge
                    variant="outline"
                    className={
                      agent.is_active
                        ? "border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-700 dark:text-emerald-400"
                        : "border-slate-500/30 bg-slate-500/10 text-[10px]"
                    }
                  >
                    {agent.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
