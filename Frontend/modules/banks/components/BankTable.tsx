// modules/banks/components/BankTable.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { documentUrl } from "@/lib/format";
import type { Bank } from "../types";

export function BankTable({
  data,
  loading,
  onEdit,
  onDelete,
}: {
  data: Bank[] | undefined;
  loading?: boolean;
  onEdit: (bank: Bank) => void;
  onDelete: (bank: Bank) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (b) =>
        b.bank_name.toLowerCase().includes(q) ||
        (b.short_code ?? "").toLowerCase().includes(q) ||
        (b.tagline ?? "").toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or code..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border bg-card">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No banks found"
            description={
              search
                ? "Try adjusting your search."
                : "Add your first partner bank to begin."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank</TableHead>
                  <TableHead className="hidden md:table-cell">Code</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Tagline
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => (
                  <TableRow key={b.bank_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                          {b.logo_path ? (
                            <img
                              src={documentUrl(b.logo_path) ?? ""}
                              alt={b.bank_name}
                              className="h-full w-full object-contain p-0.5"
                            />
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground">
                              {b.bank_name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">{b.bank_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {b.short_code || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {b.tagline || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={b.is_active ? "Active" : "Inactive"}
                        variant={b.is_active ? "success" : "neutral"}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          {/* <DropdownMenuItem onClick={() => onEdit(b)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem> */}
                          {b.apply_link && (
                            <DropdownMenuItem
                              render={
                                <a
                                  href={b.apply_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                />
                              }
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open Apply Link
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {/* <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(b)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem> */}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
          Showing {filtered.length} of {data?.length ?? 0} banks
        </p>
      )}
    </div>
  );
}
