// modules/masters/BusinessTypesPage.tsx
"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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

import { BusinessTypeFormModal } from "./modals/BusinessTypeFormModal";
import { useBusinessTypes, useDeleteBusinessType } from "./hooks/useMasters";
import type { BusinessType } from "./types";

export default function BusinessTypesPage() {
  const { data, isLoading } = useBusinessTypes(false);
  const deleteM = useDeleteBusinessType();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessType | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Types"
        description="Master list of business types used in loan applications"
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Business Type
          </Button>
        }
      />

      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="No business types"
            description="Add your first business type to begin."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((t) => (
                  <TableRow key={t.type_id}>
                    <TableCell className="font-medium">{t.type_name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {t.description || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.display_order}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={t.is_active ? "Active" : "Inactive"}
                        variant={t.is_active ? "success" : "neutral"}
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
                              setEditing(t);
                              setModalOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(t)}
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

      <BusinessTypeFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        item={editing}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this business type?"
        description={`${deleteTarget?.type_name} will be removed. Existing loans keep their reference.`}
        confirmText="Delete"
        variant="destructive"
        loading={deleteM.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteM.mutate(deleteTarget.type_id, {
            onSettled: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}
