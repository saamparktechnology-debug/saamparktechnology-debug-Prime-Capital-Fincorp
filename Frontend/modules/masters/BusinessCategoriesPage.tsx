// modules/masters/BusinessCategoriesPage.tsx
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

import { BusinessCategoryFormModal } from "./modals/BusinessCategoryFormModal";
import {
  useBusinessCategories,
  useDeleteBusinessCategory,
} from "./hooks/useMasters";
import type { BusinessCategory } from "./types";

export default function BusinessCategoriesPage() {
  const { data, isLoading } = useBusinessCategories(false);
  const deleteM = useDeleteBusinessCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessCategory | null>(
    null,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Categories"
        description="Master list of ownership categories for business loans"
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Business Category
          </Button>
        }
      />

      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="No business categories"
            description="Add your first category to begin."
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
                {data.map((c) => (
                  <TableRow key={c.category_id}>
                    <TableCell className="font-medium">
                      {c.category_name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {c.description || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.display_order}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={c.is_active ? "Active" : "Inactive"}
                        variant={c.is_active ? "success" : "neutral"}
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
                              setEditing(c);
                              setModalOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(c)}
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

      <BusinessCategoryFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        item={editing}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this category?"
        description={`${deleteTarget?.category_name} will be removed.`}
        confirmText="Delete"
        variant="destructive"
        loading={deleteM.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteM.mutate(deleteTarget.category_id, {
            onSettled: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}
