//Frontend/modules/loans/LoanDetail.tsx

"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FileText, ExternalLink, Upload, Trash2, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap, getErrorMessage } from "@/lib/api/client";
import {
  formatCurrency,
  formatDate,
  getInitials,
  documentUrl,
} from "@/lib/format";
import { usePermission } from "@/lib/hooks/usePermission";
import { useLoansList } from "./hooks/useLoans";
import { useEmisByLoan } from "@/modules/emis/hooks/useEmis";
import {
  useLoanDocumentChecklist,
  useUploadLoanDocument,
  useDeleteLoanDocument,
} from "./hooks/useLoanDocuments";
import { LoanStatusTimeline } from "./components/LoanStatusTimeline";
import { EMIScheduleTable } from "./components/EMIScheduleTable";
import { LoanStatusModal } from "./modals/LoanStatusModal";
import type { Loan } from "./types";

const isBusinessType = (t: string) => t === "Business" || t === "Business Loan";

/** Statuses in which the backend allows document mutations */
const EDITABLE_STATUSES = ["Draft", "Applied", "Under Review"];

const MAX_SIZE_MB = 5;
const ACCEPTED = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

export default function LoanDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const { isAdmin } = usePermission();
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const qc = useQueryClient();

  // ---- ALL HOOKS MUST RUN UNCONDITIONALLY ----
  const { data: loans, isLoading } = useLoansList();
  const loan = loans?.find((l) => l.loan_id === id);
  const { data: emis } = useEmisByLoan(id);

  const isBusiness = loan ? isBusinessType(loan.loan_type) : false;

  // Document checklist — only relevant for Business loans
  const checklistQ = useLoanDocumentChecklist(isBusiness ? id : undefined);
  const uploadM = useUploadLoanDocument(id);
  const deleteM = useDeleteLoanDocument(id);

  const generateM = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/loans/${id}/generate-emis`);
      return unwrap(res);
    },
    onSuccess: (data: any) => {
      toast.success(data?.message || "EMI schedule generated.");
      qc.invalidateQueries({ queryKey: ["emis"] });
      qc.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // ---- Early returns ----
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="space-y-4">
        <PageHeader title="Loan not found" />
        <p className="text-sm text-muted-foreground">
          The loan may have been removed or you don't have access.
        </p>
        <Link href="/loans" className={buttonVariants({ variant: "outline" })}>
          Back to Loans
        </Link>
      </div>
    );
  }

  const canGenerateEmis =
    isAdmin &&
    ["Disbursed", "Active"].includes(loan.loan_status) &&
    (!emis || emis.length === 0);

  const canEditDocuments =
    isBusiness && EDITABLE_STATUSES.includes(loan.loan_status);

  const displayName = loan.customer_full_name || `Loan #${loan.loan_id}`;

  // When the checklist hasn't loaded yet, fall back to the loan's own *_doc_path fields
  const docItems = checklistQ.data?.checklist ?? [
    {
      doc_type: "aadhaar",
      label: "Aadhaar Card (Front)",
      path: loan.aadhaar_doc_path,
      uploaded: Boolean(loan.aadhaar_doc_path),
    },
    {
      doc_type: "aadhaar_back",
      label: "Aadhaar Card (Back)",
      path: loan.aadhaar_back_doc_path,
      uploaded: Boolean(loan.aadhaar_back_doc_path),
    },
    {
      doc_type: "pan",
      label: "PAN Card",
      path: loan.pan_doc_path,
      uploaded: Boolean(loan.pan_doc_path),
    },
    {
      doc_type: "business_reg",
      label: "Business Registration Proof/Uddyam",
      path: loan.business_reg_doc_path,
      uploaded: Boolean(loan.business_reg_doc_path),
    },
    {
      doc_type: "bank_statement",
      label: "Bank Statement (1 Year)",
      path: loan.bank_statement_doc_path,
      uploaded: Boolean(loan.bank_statement_doc_path),
    },
    {
      doc_type: "nominee",
      label: "Nominee Document",
      path: loan.nominee_doc_path,
      uploaded: Boolean(loan.nominee_doc_path),
    },
  ];

  const uploadedCount = docItems.filter((d) => d.uploaded).length;

  const handleFile = (docType: string, file: File | null) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Only PDF, JPG, JPEG, PNG allowed.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Max ${MAX_SIZE_MB}MB.`);
      return;
    }
    uploadM.mutate({ docType, file });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Loan #${loan.loan_id}`}
        description={`${loan.loan_type} • Applied ${formatDate(loan.created_at)}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={loan.loan_status} />

            {canGenerateEmis && (
              <Button
                variant="outline"
                onClick={() => generateM.mutate()}
                disabled={generateM.isPending}
              >
                {generateM.isPending ? "Generating..." : "Generate EMIs"}
              </Button>
            )}

            {isAdmin && (
              <Button onClick={() => setStatusOpen(true)}>Update Status</Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: customer info + timeline */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {getInitials(displayName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{displayName}</p>
                  {loan.customer_phone && (
                    <p className="truncate text-xs text-muted-foreground">
                      {loan.customer_phone}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <LoanStatusTimeline status={loan.loan_status} />
            </CardContent>
          </Card>
        </div>

        {/* Right: details + documents + EMI schedule */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Loan Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Row label="Loan Type" value={loan.loan_type} />
              <Row
                label="Partner Bank"
                value={
                  loan.bank_name
                    ? `${loan.bank_name}${loan.bank_short_code ? ` (${loan.bank_short_code})` : ""}`
                    : "—"
                }
              />
              <Row
                label="Requested Amount"
                value={formatCurrency(loan.requested_amount)}
              />
              <Row
                label="Approved Amount"
                value={
                  loan.approved_amount
                    ? formatCurrency(loan.approved_amount)
                    : "—"
                }
              />
              <Row label="Tenure" value={`${loan.tenure_months} months`} />
              <Row
                label="Interest Rate"
                value={`${loan.interest_rate}% p.a.`}
              />
              <Row
                label="Interest Type"
                value={
                  loan.interest_type === "flat" ? "Flat" : "Reducing Balance"
                }
              />
              <Row
                label="Bank Reference"
                value={loan.bank_reference_number || "—"}
              />
              {isAdmin && (
                <Row
                  label="Handled by Agent"
                  value={
                    loan.agent_id == null
                      ? "Applied from office"
                      : loan.agent_name || "—"
                  }
                />
              )}
              <Row
                label="Rejection Reason"
                value={loan.rejection_reason || "—"}
              />
              <Row label="Purpose" value={loan.purpose} />
            </CardContent>
          </Card>

          {/* Nominee — Business loans only */}
          {isBusiness && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Nominee</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <Row label="Nominee Name" value={loan.nominee_name} />
                <Row label="Relationship" value={loan.nominee_relationship} />
                <Row label="Nominee Mobile" value={loan.nominee_phone} />
              </CardContent>
            </Card>
          )}

          {/* ---------- Documents (Business loans only) ---------- */}
          {isBusiness && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Documents</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {uploadedCount} / {docItems.length} uploaded
                  </Badge>
                  {!canEditDocuments && (
                    <Badge
                      variant="outline"
                      className="border-slate-500/30 bg-slate-500/10 text-[10px] text-muted-foreground"
                    >
                      Locked ({loan.loan_status})
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {docItems.map((doc) => {
                    const url = documentUrl(doc.path);
                    const isUploading =
                      uploadM.isPending &&
                      uploadM.variables?.docType === doc.doc_type;
                    const isDeleting =
                      deleteM.isPending && deleteM.variables === doc.doc_type;

                    return (
                      <li
                        key={doc.doc_type}
                        className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center"
                      >
                        <div
                          className={
                            doc.uploaded
                              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"
                              : "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                          }
                        >
                          <FileText className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {doc.label}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {doc.uploaded
                              ? doc.path!.split("/").pop()
                              : "Not uploaded"}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                          {doc.uploaded ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            >
                              UPLOADED
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            >
                              PENDING
                            </Badge>
                          )}

                          {doc.uploaded && url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                              aria-label={`View ${doc.label}`}
                              title="View"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}

                          {canEditDocuments && (
                            <>
                              <label
                                className={
                                  "flex h-8 cursor-pointer items-center justify-center rounded-md px-3 text-xs font-medium transition-colors " +
                                  (isUploading
                                    ? "bg-muted text-muted-foreground"
                                    : "text-blue-600 hover:bg-blue-500/10 dark:text-blue-400")
                                }
                                title={doc.uploaded ? "Replace" : "Upload"}
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                                    {doc.uploaded ? "Replace" : "Upload"}
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                  disabled={isUploading}
                                  onChange={(e) => {
                                    handleFile(
                                      doc.doc_type,
                                      e.target.files?.[0] ?? null,
                                    );
                                    e.target.value = "";
                                  }}
                                />
                              </label>

                              {doc.uploaded && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteTarget(doc.doc_type)}
                                  disabled={isDeleting}
                                  title="Remove"
                                >
                                  {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          <EMIScheduleTable loanId={loan.loan_id} />
        </div>
      </div>

      {isAdmin && (
        <LoanStatusModal
          loan={loan}
          open={statusOpen}
          onOpenChange={setStatusOpen}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete document?"
        description="This will permanently remove the uploaded file. You can re-upload it later."
        confirmText="Delete"
        variant="destructive"
        loading={deleteM.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteM.mutate(deleteTarget, {
            onSettled: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}
