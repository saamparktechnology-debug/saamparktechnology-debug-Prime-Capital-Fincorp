"use client";

import { useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
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
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { documentUrl } from "@/lib/format";

import { CcBankFormModal } from "./modals/CcBankFormModal";
import { useCcBanks, useDeleteCcBank } from "./hooks/useCcBanks";
import type { CreditCardBank } from "./types";

export default function CcBanksList() {
  const { data, isLoading } = useCcBanks(false);
  const deleteM = useDeleteCcBank();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CreditCardBank | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CreditCardBank | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Card Partner Banks"
        description="Manage credit card issuing partner banks"
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Bank
          </Button>
        }
      />

      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="No credit card banks"
            description="Add your first partner bank to begin."
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
                {data.map((b) => (
                  <TableRow key={b.bank_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                          {b.logo_path ? (
                            <img
                              src={documentUrl(b.logo_path) ?? ""}
                              alt={b.bank_name}
                              className="h-full w-full object-contain"
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
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(b);
                              setModalOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
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
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(b)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
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

      <CcBankFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        bank={editing}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this bank?"
        description={`${deleteTarget?.bank_name} will be removed. Existing applications will keep their reference.`}
        confirmText="Delete"
        variant="destructive"
        loading={deleteM.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteM.mutate(deleteTarget.bank_id, {
            onSettled: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}
