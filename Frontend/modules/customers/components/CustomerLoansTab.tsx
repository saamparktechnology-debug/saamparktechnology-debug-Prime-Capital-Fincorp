// modules/customers/components/CustomerLoansTab.tsx
"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Loan } from "@/lib/types/loan";

export function CustomerLoansTab({ customerId }: { customerId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["customer-loans", customerId],
    queryFn: async () => {
      const res = await api.get(ENDPOINTS.LOANS.LIST);
      const all = unwrap<Loan[]>(res);
      return all.filter((l) => l.customer_id === customerId);
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Loans</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="No loans yet"
            description="This customer hasn't applied for any loans."
          />
        ) : (
          <ul className="divide-y">
            {data.map((loan) => (
              <li key={loan.loan_id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/loans/${loan.loan_id}`}
                    className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    #{loan.loan_id} — {loan.loan_type}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(loan.requested_amount)} •{" "}
                    {loan.tenure_months} months • {loan.interest_rate}%
                  </p>
                </div>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {formatDate(loan.created_at)}
                </span>
                <StatusBadge status={loan.loan_status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
