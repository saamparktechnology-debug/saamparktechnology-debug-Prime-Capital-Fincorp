// modules/loans/components/LoanDocumentStep.tsx
"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { LoanDocumentUploadCard } from "./LoanDocumentUploadCard";
import {
  useLoanDocumentChecklist,
  useUploadLoanDocument,
  useDeleteLoanDocument,
} from "../hooks/useLoanDocuments";

export function LoanDocumentStep({
  loanId,
  onSubmitLead,
  submitting,
  onBack,
}: {
  loanId: number;
  onSubmitLead: () => void;
  submitting?: boolean;
  onBack: () => void;
}) {
  const checklistQ = useLoanDocumentChecklist(loanId);
  const uploadM = useUploadLoanDocument(loanId);
  const deleteM = useDeleteLoanDocument(loanId);

  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [deletingType, setDeletingType] = useState<string | null>(null);

  const handleUpload = (docType: string, file: File) => {
    setUploadingType(docType);
    uploadM.mutate(
      { docType, file },
      { onSettled: () => setUploadingType(null) },
    );
  };

  const handleRemove = (docType: string) => {
    setDeletingType(docType);
    deleteM.mutate(docType, { onSettled: () => setDeletingType(null) });
  };

  if (checklistQ.isLoading || !checklistQ.data) {
    return (
      <div className="space-y-4">
        <div className="h-24 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-16 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-16 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  const { checklist, uploaded_count, total_required, all_uploaded } =
    checklistQ.data;

  const pct = Math.round((uploaded_count / total_required) * 100);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card className="border-blue-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Step 2 — Upload Business Documents
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Upload all {total_required} required documents to submit the lead.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">
                {uploaded_count} / {total_required} uploaded
              </span>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
            <Progress value={pct} />
          </div>
        </CardContent>
      </Card>

      {/* Upload cards */}
      <div className="space-y-3">
        {checklist.map((item, i) => (
          <LoanDocumentUploadCard
            key={item.doc_type}
            item={item}
            index={i}
            onUpload={(file) => handleUpload(item.doc_type, file)}
            onRemove={() => handleRemove(item.doc_type)}
            uploading={uploadingType === item.doc_type}
            removing={deletingType === item.doc_type}
          />
        ))}
      </div>

      {/* Bottom checklist cracker */}
      <Card
        className={cn(
          "border-2",
          all_uploaded
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-red-500/40 bg-red-500/5",
        )}
      >
        <CardContent className="space-y-3 p-5">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                all_uploaded
                  ? "bg-emerald-500 text-white"
                  : "bg-red-500 text-white",
              )}
            >
              {all_uploaded ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {all_uploaded
                  ? "All documents uploaded"
                  : "Some documents are still pending"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {all_uploaded
                  ? "You can now submit this lead for further processing."
                  : "Please upload all required documents to proceed."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onBack} disabled={submitting}>
              Back to Edit
            </Button>
            <Button
              onClick={onSubmitLead}
              disabled={!all_uploaded || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Lead"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
