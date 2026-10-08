// modules/kyc/modals/ReviewKYCModal.tsx
"use client";

import { useState } from "react";
import { Loader2, FileText, ExternalLink } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import { useReviewKYC, useKycDocuments } from "../hooks/useKyc";
import { formatDate, documentUrl } from "@/lib/format";

export function ReviewKYCModal({
  customerId,
  customerName,
  open,
  onOpenChange,
}: {
  customerId: number;
  customerName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [mode, setMode] = useState<"approve" | "reject">("approve");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reviewM = useReviewKYC(customerId);
  const docsQ = useKycDocuments(open ? customerId : undefined);

  const handleSubmit = () => {
    setError(null);

    if (mode === "reject" && !reason.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    reviewM.mutate(
      {
        status: mode === "approve" ? "approved" : "rejected",
        rejection_reason: mode === "reject" ? reason.trim() : undefined,
      },
      {
        onSuccess: () => {
          setReason("");
          setMode("approve");
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setReason("");
          setMode("approve");
          setError(null);
        }
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review KYC</DialogTitle>
          <DialogDescription>
            {customerName ? `Customer: ${customerName}` : "Customer KYC review"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Uploaded Documents */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Uploaded Documents ({docsQ.data?.length ?? 0})
            </Label>

            {docsQ.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !docsQ.data || docsQ.data.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                No documents uploaded yet. Ask the agent to upload before
                reviewing.
              </div>
            ) : (
              <ul className="divide-y rounded-lg border">
                {docsQ.data.map((doc) => {
                  const url = documentUrl(doc.file_path);
                  return (
                    <li
                      key={doc.document_id}
                      className="flex items-center gap-3 p-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {doc.document_type}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {doc.file_name} • {formatDate(doc.created_at)}
                        </p>
                      </div>
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-md text-blue-600 hover:bg-muted dark:text-blue-400"
                          aria-label="Open document"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Decision */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("approve")}
              className={`rounded-lg border p-3 text-left transition-colors ${
                mode === "approve"
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "hover:bg-muted/40"
              }`}
            >
              <div className="text-sm font-medium">Approve</div>
              <div className="text-xs text-muted-foreground">
                KYC is valid, customer can apply for loans
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMode("reject")}
              className={`rounded-lg border p-3 text-left transition-colors ${
                mode === "reject"
                  ? "border-red-500 bg-red-500/10"
                  : "hover:bg-muted/40"
              }`}
            >
              <div className="text-sm font-medium">Reject</div>
              <div className="text-xs text-muted-foreground">
                Documents invalid, ask for resubmission
              </div>
            </button>
          </div>

          {mode === "reject" && (
            <div className="space-y-2">
              <Label>
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                rows={3}
                placeholder="e.g., Aadhaar copy is blurred, please re-upload..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={reviewM.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={reviewM.isPending}
            variant={mode === "reject" ? "destructive" : "default"}
          >
            {reviewM.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : mode === "approve" ? (
              "Approve KYC"
            ) : (
              "Reject KYC"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
