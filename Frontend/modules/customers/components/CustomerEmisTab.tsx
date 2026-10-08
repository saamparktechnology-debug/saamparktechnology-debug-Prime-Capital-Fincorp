// modules/customers/components/CustomerEmisTab.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { useUpcomingEmis } from "@/modules/dashboard/hooks/useDashboard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";

export function CustomerEmisTab({ customerId }: { customerId: number }) {
  const { data, isLoading } = useUpcomingEmis();
  const filtered = (data ?? []).filter((e) => e.customer_id === customerId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Upcoming EMIs</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No upcoming EMIs"
            description="All installments settled or none scheduled."
          />
        ) : (
          <ul className="divide-y">
            {filtered.map((emi) => (
              <li key={emi.emi_id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {formatCurrency(emi.emi_amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Loan #{emi.loan_id} • Due {formatDate(emi.due_date)}
                  </p>
                </div>
                <StatusBadge status={emi.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
