// modules/loans/components/LoanDocumentStep.tsx
"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Info, Lock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { LoanDocumentUploadCard } from "./LoanDocumentUploadCard";
import {
  useLoanDocumentChecklist,
  useUploadLoanDocument,
  useDeleteLoanDocument,
} from "../hooks/useLoanDocuments";

/** Docs that MUST be uploaded before the lead can be submitted */
const REQUIRED_DOC_TYPES = [
  "aadhaar",
  "aadhaar_back",
  "pan",
  "business_reg",
  "bank_statement",
];

/** Docs that can be added later from the detail page */
const OPTIONAL_DOC_TYPES = ["nominee"];

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

  const { checklist } = checklistQ.data;

  const requiredDocs = checklist.filter((d) =>
    REQUIRED_DOC_TYPES.includes(d.doc_type),
  );
  const optionalDocs = checklist.filter((d) =>
    OPTIONAL_DOC_TYPES.includes(d.doc_type),
  );

  const requiredUploaded = requiredDocs.filter((d) => d.uploaded).length;
  const optionalUploaded = optionalDocs.filter((d) => d.uploaded).length;

  const totalRequired = requiredDocs.length;
  const allRequiredUploaded = requiredUploaded === totalRequired;

  const pct = totalRequired
    ? Math.round((requiredUploaded / totalRequired) * 100)
    : 0;

  // Aadhaar Back is only enabled after Aadhaar Front is uploaded
  const aadhaarFrontUploaded = Boolean(
    checklist.find((d) => d.doc_type === "aadhaar")?.uploaded,
  );

  /** Whether a given doc is currently allowed to receive an upload */
  const isDocUnlocked = (docType: string) => {
    if (docType === "aadhaar_back") return aadhaarFrontUploaded;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card className="border-blue-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Step 2 — Upload Business Documents
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Upload all {totalRequired} required documents to submit the lead.
            The Nominee document is optional and can be added later.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">
                {requiredUploaded} / {totalRequired} required uploaded
              </span>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
            <Progress value={pct} />
          </div>
        </CardContent>
      </Card>

      {/* Required documents */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <h3 className="text-sm font-semibold">Required</h3>
          <span className="text-xs text-muted-foreground">
            ({requiredUploaded}/{totalRequired})
          </span>
        </div>

        {requiredDocs.map((item, i) => {
          const unlocked = isDocUnlocked(item.doc_type);
          const isAadhaarBack = item.doc_type === "aadhaar_back";

          return (
            <div key={item.doc_type} className="space-y-1">
              <LoanDocumentUploadCard
                item={item}
                index={i}
                onUpload={(file) => handleUpload(item.doc_type, file)}
                onRemove={() => handleRemove(item.doc_type)}
                uploading={uploadingType === item.doc_type}
                removing={deletingType === item.doc_type}
                disabled={!unlocked}
              />

              {isAadhaarBack && !unlocked && (
                <div className="flex items-start gap-2 px-3 text-xs text-muted-foreground">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Upload the Aadhaar Card (Front) first to unlock this slot.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Optional documents */}
      {optionalDocs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <h3 className="text-sm font-semibold">Optional</h3>
            <span className="text-xs text-muted-foreground">
              ({optionalUploaded}/{optionalDocs.length}) — can be uploaded later
            </span>
          </div>

          {optionalDocs.map((item, i) => (
            <LoanDocumentUploadCard
              key={item.doc_type}
              item={item}
              index={requiredDocs.length + i}
              onUpload={(file) => handleUpload(item.doc_type, file)}
              onRemove={() => handleRemove(item.doc_type)}
              uploading={uploadingType === item.doc_type}
              removing={deletingType === item.doc_type}
            />
          ))}
        </div>
      )}

      {/* Bottom status card */}
      <Card
        className={cn(
          "border-2",
          allRequiredUploaded
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-red-500/40 bg-red-500/5",
        )}
      >
        <CardContent className="space-y-3 p-5">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                allRequiredUploaded
                  ? "bg-emerald-500 text-white"
                  : "bg-red-500 text-white",
              )}
            >
              {allRequiredUploaded ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {allRequiredUploaded
                  ? "All required documents uploaded"
                  : "Some required documents are still pending"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {allRequiredUploaded
                  ? "You can submit this lead. The Nominee document can be added later."
                  : "Please upload all required documents to proceed."}
              </p>
            </div>
          </div>

          {allRequiredUploaded && optionalUploaded < optionalDocs.length && (
            <div className="flex items-start gap-2 rounded-md border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-700 dark:text-blue-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                You can still upload the Nominee document now, or skip and add
                it later from the loan detail page.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onBack} disabled={submitting}>
              Back to Edit
            </Button>
            <Button
              onClick={onSubmitLead}
              disabled={!allRequiredUploaded || submitting}
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
