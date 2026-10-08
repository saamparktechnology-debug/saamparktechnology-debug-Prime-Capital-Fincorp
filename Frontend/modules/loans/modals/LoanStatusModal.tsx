// modules/loans/modals/LoanStatusModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useBanksList } from "@/modules/banks/hooks/useBanks";
import { useUpdateLoanStatus } from "../hooks/useLoans";
import { LOAN_STATUS_LIST, type Loan, type LoanStatus } from "../types";
import { type SelectOption, optionTag } from "@/lib/format";

const LOAN_STATUS_OPTIONS: SelectOption[] = LOAN_STATUS_LIST.map((s) => ({
  value: s,
  tag: s,
}));

export function LoanStatusModal({
  loan,
  open,
  onOpenChange,
}: {
  loan: Loan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateM = useUpdateLoanStatus(loan?.loan_id);

  const [status, setStatus] = useState<LoanStatus>("Applied");
  const [approvedAmount, setApprovedAmount] = useState<string>("");
  const [bankRef, setBankRef] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { data: banks } = useBanksList();
  const [bankId, setBankId] = useState<number | null>(null);

  // Dynamic bank options
  const bankOptions = useMemo<SelectOption[]>(
    () =>
      (banks ?? [])
        .filter((b) => b.is_active)
        .map((b) => ({
          value: String(b.bank_id),
          tag: b.bank_name,
        })),
    [banks],
  );

  useEffect(() => {
    if (open && loan) {
      setStatus(loan.loan_status);
      setApprovedAmount(
        loan.approved_amount ? String(loan.approved_amount) : "",
      );
      setBankRef(loan.bank_reference_number ?? "");
      setBankId(loan.bank_id ?? null);
      setRejectionReason(loan.rejection_reason ?? "");
      setError(null);
    }
  }, [open, loan]);

  const requiresApprovedAmount =
    status === "Approved" || status === "Disbursed";
  const requiresBankRef = status === "Approved" || status === "Disbursed";
  const requiresRejection = status === "Rejected";

  const handleSubmit = () => {
    setError(null);

    if (requiresApprovedAmount && !approvedAmount) {
      setError("Approved amount is required.");
      return;
    }
    if (requiresBankRef && !bankRef.trim()) {
      setError("Bank reference number is required.");
      return;
    }
    if (requiresRejection && !rejectionReason.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    updateM.mutate(
      {
        loan_status: status,
        approved_amount: requiresApprovedAmount
          ? Number(approvedAmount)
          : undefined,
        bank_reference_number: requiresBankRef ? bankRef.trim() : undefined,
        rejection_reason: requiresRejection
          ? rejectionReason.trim()
          : undefined,
        bank_id: bankId ?? undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Loan Status</DialogTitle>
          <DialogDescription>
            Loan #{loan?.loan_id} — current: {loan?.loan_status}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>New Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus((v ?? "Applied") as LoanStatus)}
            >
              <SelectTrigger>
                <span>
                  {optionTag(LOAN_STATUS_OPTIONS, status) ?? "Applied"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {LOAN_STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {requiresApprovedAmount && (
            <div className="space-y-2">
              <Label>
                Approved Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                placeholder={String(loan?.requested_amount ?? "")}
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
              />
            </div>
          )}

          {requiresBankRef && (
            <>
              {/* Partner Bank */}
              <div className="space-y-2">
                <Label>Partner Bank</Label>
                <Select
                  value={bankId ? String(bankId) : ""}
                  onValueChange={(v) => setBankId(v ? Number(v) : null)}
                >
                  <SelectTrigger>
                    <span className={!bankId ? "text-muted-foreground" : ""}>
                      {optionTag(bankOptions, bankId) ?? "Select bank"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {bankOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bank Reference Number ← NEW */}
              <div className="space-y-2">
                <Label>
                  Bank Reference Number{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g., HDFC-2026-991"
                  value={bankRef}
                  onChange={(e) => setBankRef(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the reference/sanction number from the partner bank.
                </p>
              </div>
            </>
          )}

          {requiresRejection && (
            <div className="space-y-2">
              <Label>
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                rows={3}
                placeholder="e.g., Insufficient income proof"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateM.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateM.isPending}
            variant={status === "Rejected" ? "destructive" : "default"}
          >
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
