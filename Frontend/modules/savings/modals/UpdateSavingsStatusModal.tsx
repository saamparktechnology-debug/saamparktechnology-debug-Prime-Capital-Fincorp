// modules/savings/modals/UpdateSavingsStatusModal.tsx
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import { useUpdateSavingsStatus } from "../hooks/useSavings";
import { type SelectOption, optionTag } from "@/lib/format";
import type { SavingsStatus } from "../types";

const STATUS_OPTIONS: SelectOption[] = [
  { value: "initiated", tag: "Initiated" },
  { value: "completed", tag: "Completed" },
  { value: "cancelled", tag: "Cancelled" },
];

export function UpdateSavingsStatusModal({
  applicationId,
  customerName,
  currentStatus,
  open,
  onOpenChange,
}: {
  applicationId: number;
  customerName: string;
  currentStatus: SavingsStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [status, setStatus] = useState<SavingsStatus>(currentStatus);
  const [notes, setNotes] = useState("");

  const updateM = useUpdateSavingsStatus();

  useEffect(() => {
    if (open) {
      setStatus(currentStatus);
      setNotes("");
    }
  }, [open, currentStatus]);

  const handleSubmit = () => {
    updateM.mutate(
      { id: applicationId, status, notes: notes.trim() || undefined },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <DialogDescription>{customerName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>New Status</Label>
            <Select
              value={status}
              onValueChange={(v) =>
                setStatus((v ?? "initiated") as SavingsStatus)
              }
            >
              <SelectTrigger>
                <span>{optionTag(STATUS_OPTIONS, status) ?? "Initiated"}</span>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              rows={3}
              placeholder="e.g., Account opened, welcome kit dispatched"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
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
              "Update Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
