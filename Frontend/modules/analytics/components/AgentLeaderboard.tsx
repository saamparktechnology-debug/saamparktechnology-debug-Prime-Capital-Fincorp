// modules/analytics/components/AgentLeaderboard.tsx
"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { AgentLeaderboardRow } from "../types";

export function AgentLeaderboard({
  data,
  loading,
}: {
  data: AgentLeaderboardRow[] | undefined;
  loading?: boolean;
}) {
  const rows = data ?? [];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="inline-flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-amber-500" />
          Agent Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            No agents yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-right">Customers</TableHead>
                  <TableHead className="text-right">Loans</TableHead>
                  <TableHead className="text-right">Portfolio</TableHead>
                  <TableHead className="text-right">Collected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a, i) => (
                  <TableRow key={a.agent_id} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-xs">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/agents/${a.agent_id}`}
                        className="hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                      >
                        {a.full_name}
                      </Link>
                      {!a.is_active && (
                        <Badge
                          variant="outline"
                          className="ml-2 border-slate-500/30 bg-slate-500/10 text-[10px]"
                        >
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(a.total_customers)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(a.total_loans)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(a.portfolio_value)}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(a.total_collected)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
