// modules/agents/modals/ReviewAgentKycModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2, FileText, Eye, Download } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import { useReviewAgentKyc, useAgentDocuments } from "../hooks/useAgentKyc";
import { formatDate, documentUrl } from "@/lib/format";
import { cn } from "@/lib/utils";

// Helpers
const todayStr = () => new Date().toISOString().split("T")[0];
const oneYearLaterStr = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
};

export function ReviewAgentKycModal({
  agentId,
  agentName,
  open,
  onOpenChange,
}: {
  agentId: number;
  agentName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [mode, setMode] = useState<"approve" | "reject">("approve");
  const [reason, setReason] = useState("");
  const [issueDate, setIssueDate] = useState(todayStr());
  const [validTill, setValidTill] = useState(oneYearLaterStr());
  const [error, setError] = useState<string | null>(null);

  const reviewM = useReviewAgentKyc(agentId);
  const docsQ = useAgentDocuments(open ? agentId : undefined);

  useEffect(() => {
    if (open) {
      setMode("approve");
      setReason("");
      setIssueDate(todayStr());
      setValidTill(oneYearLaterStr());
      setError(null);
    }
  }, [open]);

  // Auto-adjust validTill when issueDate changes
  useEffect(() => {
    if (!issueDate) return;
    const d = new Date(issueDate);
    d.setFullYear(d.getFullYear() + 1);
    setValidTill(d.toISOString().split("T")[0]);
  }, [issueDate]);

  const handleSubmit = () => {
    setError(null);

    if (mode === "reject" && !reason.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    if (mode === "approve") {
      if (!issueDate) {
        setError("Issue date is required.");
        return;
      }
      if (!validTill) {
        setError("Valid till date is required.");
        return;
      }
      if (new Date(validTill) <= new Date(issueDate)) {
        setError("Valid till must be after issue date.");
        return;
      }
    }

    reviewM.mutate(
      {
        status: mode === "approve" ? "approved" : "rejected",
        rejection_reason: mode === "reject" ? reason.trim() : undefined,
        issue_date: mode === "approve" ? issueDate : undefined,
        valid_till: mode === "approve" ? validTill : undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review Agent KYC</DialogTitle>
          <DialogDescription>
            {agentName ? `Agent: ${agentName}` : "Verify agent KYC"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Documents */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Documents ({docsQ.data?.length ?? 0})
            </Label>
            {docsQ.isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : !docsQ.data || docsQ.data.length === 0 ? (
              <div className="rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground">
                No documents uploaded.
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
                      <FileText className="h-4 w-4 text-blue-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {doc.document_type}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {doc.file_name} • {formatDate(doc.created_at)}
                        </p>
                      </div>
                      {url && (
                        <div className="flex items-center gap-1">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-blue-600 hover:bg-muted"
                            aria-label="View"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                          <a
                            href={url}
                            download
                            className="flex h-8 w-8 items-center justify-center rounded-md text-blue-600 hover:bg-muted"
                            aria-label="Download"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
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
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                mode === "approve"
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "hover:bg-muted/40",
              )}
            >
              <div className="text-sm font-medium">Approve</div>
              <div className="text-xs text-muted-foreground">
                KYC verified, agent cleared
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMode("reject")}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                mode === "reject"
                  ? "border-red-500 bg-red-500/10"
                  : "hover:bg-muted/40",
              )}
            >
              <div className="text-sm font-medium">Reject</div>
              <div className="text-xs text-muted-foreground">
                Documents invalid, ask for resubmission
              </div>
            </button>
          </div>

          {/* Issue / Valid dates — only for approve */}
          {mode === "approve" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>
                  Issue Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Valid Till <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={validTill}
                  onChange={(e) => setValidTill(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Rejection reason — only for reject */}
          {mode === "reject" && (
            <div className="space-y-2">
              <Label>
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                rows={3}
                placeholder="e.g., ID photo is not clear, please re-upload..."
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
