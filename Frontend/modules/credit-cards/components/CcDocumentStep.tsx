// modules/credit-cards/components/CcDocumentStep.tsx
"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { CcDocumentUploadCard } from "./CcDocumentUploadCard";
import {
  useCcChecklist,
  useUploadCcDocument,
  useDeleteCcDocument,
} from "../hooks/useCreditCards";

export function CcDocumentStep({
  applicationId,
  onSubmit,
  submitting,
  onBack,
}: {
  applicationId: number;
  onSubmit: () => void;
  submitting?: boolean;
  onBack: () => void;
}) {
  const checklistQ = useCcChecklist(applicationId);
  const uploadM = useUploadCcDocument(applicationId);
  const deleteM = useDeleteCcDocument(applicationId);

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
      <Card className="border-violet-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Step 2 — Upload FD Documents
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            FD Credit Cards require Aadhaar and PAN documents.
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

      <div className="space-y-3">
        {checklist.map((item, i) => (
          <CcDocumentUploadCard
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
                  ? "You can now submit this application."
                  : "Please upload all required documents to proceed."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onBack} disabled={submitting}>
              Back to Edit
            </Button>
            <Button onClick={onSubmit} disabled={!all_uploaded || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
