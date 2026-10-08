// modules/dashboard/components/AgentPerformanceCard.tsx
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { AdminAgentOverviewRow } from "@/lib/types/analytics";

export function AgentPerformanceCard({
  data,
  loading,
}: {
  data: AdminAgentOverviewRow[] | undefined;
  loading?: boolean;
}) {
  const rows = (data ?? []).slice(0, 6);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Agent Performance</CardTitle>
        <Button variant="ghost" size="sm">
          <Link href="/agents">View all</Link>
        </Button>
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
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-right">Customers</TableHead>
                  <TableHead className="text-right">Loans</TableHead>
                  <TableHead className="text-right">Portfolio</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.agent_id}>
                    <TableCell className="font-medium">{a.full_name}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(a.total_customers)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(a.total_loans)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(a.active_portfolio_value)}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge
                        status={a.is_active ? "Active" : "Inactive"}
                        variant={a.is_active ? "success" : "neutral"}
                      />
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
