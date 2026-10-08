// modules/customers/components/CustomerDocumentsTab.tsx
"use client";

import { useState } from "react";
import { FileText, Upload, Trash2, Loader2, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

import { useKycDocuments, useDeleteDocument } from "@/modules/kyc/hooks/useKyc";
import { UploadDocumentModal } from "@/modules/kyc/modals/UploadDocumentModal";
import { formatDate, documentUrl } from "@/lib/format";
import { KYC_STATUS } from "@/lib/constants/statuses";
import type { Customer } from "@/lib/types/customer";

export function CustomerDocumentsTab({ customer }: { customer: Customer }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { data, isLoading, refetch } = useKycDocuments(customer.customer_id);
  const deleteM = useDeleteDocument(customer.customer_id);

  const canDelete =
    customer.kyc_status === KYC_STATUS.PENDING ||
    customer.kyc_status === KYC_STATUS.REJECTED;

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteM.mutate(deleteTarget, {
      onSettled: () => setDeleteTarget(null),
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Documents</CardTitle>
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : !data || data.length === 0 ? (
            <EmptyState
              title="No documents uploaded"
              description="Upload KYC documents to begin verification."
              icon={<FileText className="h-6 w-6" />}
            />
          ) : (
            <ul className="divide-y">
              {data.map((doc) => {
                const url = documentUrl(doc.file_path);
                return (
                  <li
                    key={doc.document_id}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {doc.document_type}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {doc.file_name} • {formatDate(doc.created_at)}
                      </p>
                    </div>

                    {/* Open document link */}
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Open document"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}

                    {/* Delete button */}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(doc.document_id)}
                        disabled={deleteM.isPending}
                        aria-label="Delete document"
                      >
                        {deleteM.isPending &&
                        deleteTarget === doc.document_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {!canDelete && data && data.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Documents are locked because KYC is {customer.kyc_status}.
            </p>
          )}
        </CardContent>
      </Card>

      <UploadDocumentModal
        customerId={customer.customer_id}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSuccess={() => refetch()}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this document?"
        description="This action cannot be undone. You'll need to re-upload if required."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={deleteM.isPending}
      />
    </>
  );
}
