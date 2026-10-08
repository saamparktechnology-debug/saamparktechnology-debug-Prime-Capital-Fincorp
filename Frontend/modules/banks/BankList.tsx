// modules/banks/BankList.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

import { BankTable } from "./components/BankTable";
import { BankFormModal } from "./modals/BankFormModal";
import { useBanksList, useDeleteBank } from "./hooks/useBanks";
import { usePermission } from "@/lib/hooks/usePermission";
import type { Bank } from "./types";

export default function BankList() {
  const { data, isLoading } = useBanksList();
  const deleteM = useDeleteBank();
  const { isAdmin } = usePermission();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Bank | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Bank | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partner Banks"
        description="Manage partner banks for loan disbursements"
        action={
          isAdmin ? (
            <Button
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Bank
            </Button>
          ) : undefined
        }
      />

      <BankTable
        data={data}
        loading={isLoading}
        onEdit={(b) => {
          setEditing(b);
          setModalOpen(true);
        }}
        onDelete={(b) => setDeleteTarget(b)}
      />

      <BankFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        bank={editing}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this bank?"
        description={`${deleteTarget?.bank_name} will be removed. Existing loans will keep their reference.`}
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
