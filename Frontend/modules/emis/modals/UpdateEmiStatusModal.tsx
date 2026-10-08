// modules/emis/modals/UpdateEmiStatusModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import { useUpdateEmiStatus } from "../hooks/useEmis";
import { EMI_STATUS_LIST, type EmiStatus } from "../types";
import {
  formatCurrency,
  formatDate,
  type SelectOption,
  optionTag,
} from "@/lib/format";

const EMI_STATUS_OPTIONS: SelectOption[] = EMI_STATUS_LIST.map((s) => ({
  value: s,
  tag: s,
}));

export function UpdateEmiStatusModal({
  emiId,
  customerName,
  amount,
  dueDate,
  currentStatus,
  open,
  onOpenChange,
}: {
  emiId: number;
  customerName: string;
  amount: number;
  dueDate: string;
  currentStatus: EmiStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [status, setStatus] = useState<EmiStatus>(currentStatus);
  const updateM = useUpdateEmiStatus();

  useEffect(() => {
    if (open) setStatus(currentStatus);
  }, [open, currentStatus]);

  const handleSubmit = () => {
    updateM.mutate({ emiId, status }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update EMI Status</DialogTitle>
          <DialogDescription>
            {customerName} — {formatCurrency(amount)} due {formatDate(dueDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus((v ?? "Pending") as EmiStatus)}
          >
            <SelectTrigger>
              <span>{optionTag(EMI_STATUS_OPTIONS, status) ?? "Pending"}</span>
            </SelectTrigger>
            <SelectContent>
              {EMI_STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateM.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateM.isPending}>
            {updateM.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
