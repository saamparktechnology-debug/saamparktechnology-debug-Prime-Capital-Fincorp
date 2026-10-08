// modules/analytics/components/AgentOverviewTable.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

import { formatCurrency, formatNumber } from "@/lib/format";
import type { AdminAgentOverviewRow } from "../types";

export function AgentOverviewTable({
  data,
  loading,
}: {
  data: AdminAgentOverviewRow[] | undefined;
  loading?: boolean;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (a) =>
        a.full_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone_number.includes(q),
    );
  }, [data, search]);

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search agents..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border bg-card">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No agents found"
            description={
              search ? "Try a different search." : "No agents registered yet."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="text-right">Customers</TableHead>
                  <TableHead className="text-right">Loans</TableHead>
                  <TableHead className="text-right">Portfolio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.agent_id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{a.full_name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {a.email}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(a.total_customers)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(a.total_loans)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(a.active_portfolio_value)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={a.is_active ? "Active" : "Inactive"}
                        variant={a.is_active ? "success" : "neutral"}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/analytics/agents/${a.agent_id}`}
                        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {data?.length ?? 0} agents
        </p>
      )}
    </div>
  );
}
