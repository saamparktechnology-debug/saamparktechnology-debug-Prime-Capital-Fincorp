// modules/dashboard/components/BankListCard.tsx
"use client";

import Link from "next/link";
import { Landmark, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

export function BankListCard({
  data,
  loading,
}: {
  data:
    | Array<{
        bank_id: number;
        bank_name: string;
        short_code: string | null;
        is_active: number;
        loan_count: number;
        total_disbursed: string | number;
      }>
    | undefined;
  loading?: boolean;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">All Banks</CardTitle>
        <Link
          href="/banks"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          View all
          <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        ) : !data || data.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            No banks registered
          </div>
        ) : (
          data.map((bank) => (
            <div
              key={bank.bank_id}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Landmark className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">
                    {bank.bank_name}
                  </p>
                  {bank.is_active ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-700 dark:text-emerald-400"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-slate-500/30 bg-slate-500/10 text-[10px]"
                    >
                      Inactive
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {bank.loan_count} loan{bank.loan_count === 1 ? "" : "s"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatCurrency(bank.total_disbursed)}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
