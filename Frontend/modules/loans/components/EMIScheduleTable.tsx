// modules/loans/components/EMIScheduleTable.tsx
"use client";

import { useEmisByLoan } from "@/modules/emis/hooks/useEmis";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";

import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatCurrency, formatDate } from "@/lib/format";
import type { EMI } from "@/lib/types/emi";

export function EMIScheduleTable({ loanId }: { loanId: number }) {
  const router = useRouter();

  const { data, isLoading } = useEmisByLoan(loanId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">EMI Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="No EMI schedule yet"
            description="The schedule will appear once the loan is disbursed."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Paid On
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((emi) => (
                  <TableRow key={emi.emi_id}>
                    <TableCell className="font-medium">
                      {emi.installment_number}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(emi.emi_amount)}
                    </TableCell>
                    <TableCell>{formatDate(emi.due_date)}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {emi.paid_date ? formatDate(emi.paid_date) : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={emi.status} />
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
