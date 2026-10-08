// modules/kyc/components/KycQueueTable.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Eye } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

import { useCustomersList } from "@/modules/customers/hooks/useCustomers";
import { formatDate, type SelectOption, optionTag } from "@/lib/format";
import { KYC_STATUS, type KycStatus } from "@/lib/constants/statuses";
import type { Customer } from "@/lib/types/customer";

const KYC_FILTER_OPTIONS: SelectOption[] = [
  { value: "all", tag: "All" },
  { value: KYC_STATUS.PENDING, tag: "Pending" },
  { value: KYC_STATUS.APPROVED, tag: "Approved" },
  { value: KYC_STATUS.REJECTED, tag: "Rejected" },
];

export function KycQueueTable({
  onReview,
}: {
  onReview?: (customer: Customer) => void;
}) {
  const { data, isLoading } = useCustomersList();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<KycStatus | "all">(KYC_STATUS.PENDING);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.filter((c) => {
      if (filter !== "all" && c.kyc_status !== filter) return false;
      if (!q) return true;
      return (
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.primary_phone.includes(q)
      );
    });
  }, [data, search, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name or phone..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select
          value={filter}
          onValueChange={(v) => setFilter((v ?? "all") as KycStatus | "all")}
        >
          <SelectTrigger className="w-[180px]">
            <span>{optionTag(KYC_FILTER_OPTIONS, filter) ?? "All"}</span>
          </SelectTrigger>
          <SelectContent>
            {KYC_FILTER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No KYC records"
            description={
              filter === KYC_STATUS.PENDING
                ? "No customers awaiting KYC review."
                : "No customers match the current filter."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden md:table-cell">
                    National ID
                  </TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Submitted
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.customer_id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">
                      <Link
                        href={`/customers/${c.customer_id}`}
                        className="hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                      >
                        {c.first_name} {c.last_name}
                      </Link>
                    </TableCell>
                    <TableCell>{c.primary_phone}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {c.national_id_number}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.kyc_status} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {formatDate(c.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View — styled link */}
                        <Link
                          href={`/customers/${c.customer_id}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "sm",
                          })}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {/* Review — admin only, pending only */}
                        {c.kyc_status === KYC_STATUS.PENDING && onReview && (
                          <Button size="sm" onClick={() => onReview(c)}>
                            Review
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {!isLoading && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {data?.length ?? 0} customers
        </p>
      )}
    </div>
  );
}
