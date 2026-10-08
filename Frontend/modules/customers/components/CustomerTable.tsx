// modules/customers/components/CustomerTable.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
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
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { formatDate, type SelectOption, optionTag } from "@/lib/format";
import type { Customer } from "../types";
import { KYC_STATUS } from "@/lib/constants/statuses";

const KYC_FILTER_OPTIONS: SelectOption[] = [
  { value: "all", tag: "All KYC statuses" },
  { value: KYC_STATUS.PENDING, tag: "Pending" },
  { value: KYC_STATUS.APPROVED, tag: "Approved" },
  { value: KYC_STATUS.REJECTED, tag: "Rejected" },
];

export function CustomerTable({
  data,
  loading,
}: {
  data: Customer[] | undefined;
  loading?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.filter((c) => {
      if (kycFilter !== "all" && c.kyc_status !== kycFilter) return false;
      if (!q) return true;
      return (
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.primary_phone.includes(q) ||
        c.national_id_number.toLowerCase().includes(q)
      );
    });
  }, [data, search, kycFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, or national ID..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={kycFilter}
            onValueChange={(v) => setKycFilter(v ?? "all")}
          >
            <SelectTrigger className="w-[160px]">
              <span>
                {optionTag(KYC_FILTER_OPTIONS, kycFilter) ?? "All KYC statuses"}
              </span>
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
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No customers found"
            description={
              search || kycFilter !== "all"
                ? "Try adjusting your filters."
                : "Register your first customer to get started."
            }
            action={
              !search && kycFilter === "all" ? (
                <Link href="/customers/new" className={buttonVariants()}>
                  Add Customer
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden md:table-cell">
                    National ID
                  </TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.customer_id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">
                      {c.first_name} {c.middle_name ?? ""} {c.last_name}
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
                      <Link
                        href={`/customers/${c.customer_id}`}
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
          Showing {filtered.length} of {data?.length ?? 0} customers
        </p>
      )}
    </div>
  );
}
