// modules/dashboard/components/RecentLoansCard.tsx
"use client";

import Link from "next/link";
import { ArrowRight, FileSpreadsheet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";

export function RecentLoansCard({
  data,
  loading,
}: {
  data:
    | Array<{
        loan_id: number;
        customer_id: number;
        loan_type: string;
        requested_amount: string | number;
        approved_amount: string | number | null;
        loan_status: string;
        created_at: string;
        first_name: string;
        last_name: string;
        bank_name: string | null;
      }>
    | undefined;
  loading?: boolean;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Recent Loans</CardTitle>
        <Link
          href="/loans"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          View all
          <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            No loans yet
          </div>
        ) : (
          <ul className="divide-y">
            {data.map((loan) => (
              <li
                key={loan.loan_id}
                className="flex items-center gap-3 py-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/loans/${loan.loan_id}`}
                    className="truncate text-sm font-medium hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                  >
                    {loan.first_name} {loan.last_name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    #{loan.loan_id} • {loan.loan_type}
                    {loan.bank_name ? ` • ${loan.bank_name}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(
                      loan.approved_amount ?? loan.requested_amount,
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDate(loan.created_at)}
                  </p>
                </div>
                <StatusBadge status={loan.loan_status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
