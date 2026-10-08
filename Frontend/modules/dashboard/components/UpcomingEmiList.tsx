// modules/dashboard/components/UpcomingEmiList.tsx
"use client";

import { CalendarClock, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { UpcomingEMI } from "@/lib/types/emi";
import { formatCurrency, formatDate } from "@/lib/format";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function UpcomingEmiList({
  data,
  loading,
}: {
  data: UpcomingEMI[] | undefined;
  loading?: boolean;
}) {
  const list = data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Upcoming EMIs</CardTitle>
        <Button variant="ghost" size="sm">
          <Link href="/emis">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <>
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </>
        ) : list.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No upcoming EMIs
          </div>
        ) : (
          list.slice(0, 5).map((emi) => (
            <div
              key={emi.emi_id}
              className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <CalendarClock className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">
                    {emi.first_name} {emi.last_name}
                  </p>
                  <span className="text-sm font-semibold">
                    {formatCurrency(emi.emi_amount)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>Due {formatDate(emi.due_date)}</span>
                  {emi.primary_phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {emi.primary_phone}
                    </span>
                  )}
                  {emi.email_address && (
                    <span className="hidden items-center gap-1 md:inline-flex">
                      <Mail className="h-3 w-3" />
                      {emi.email_address}
                    </span>
                  )}
                </div>
              </div>
              <StatusBadge status={emi.status} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
