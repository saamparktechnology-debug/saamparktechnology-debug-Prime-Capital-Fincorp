//Frontend/modules/credit-cards/CreditCardDetail.tsx
"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  FileText,
  ExternalLink,
  Upload,
  Trash2,
  Loader2,
  Building2,
  CreditCard as CreditCardIcon,
  Landmark,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Separator } from "@/components/ui/separator";

import {
  formatDate,
  getInitials,
  documentUrl,
  formatCurrency,
} from "@/lib/format";
import { usePermission } from "@/lib/hooks/usePermission";
import { useCreditCardApplications } from "./hooks/useCreditCards";
import {
  useCcChecklist,
  useUploadCcDocument,
  useDeleteCcDocument,
} from "./hooks/useCreditCards";
import { UpdateCCStatusModal } from "./modals/UpdateCCStatusModal";
import { cardTypeLabel } from "./utils/cardTypes";

const MAX_SIZE_MB = 5;
const ACCEPTED = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

/** Backend only allows doc mutations when status === "initiated" */
const DOC_EDITABLE_STATUS = "initiated";

export default function CreditCardDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const { isAdmin } = usePermission();

  const [statusOpen, setStatusOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // ---- Hooks must run unconditionally ----
  const appsQ = useCreditCardApplications();
  const allApps = appsQ.data ?? [];
  const app = allApps.find((a) => a.application_id === id);

  const isFd = app?.card_type === "fd";

  const checklistQ = useCcChecklist(isFd ? id : undefined);
  const uploadM = useUploadCcDocument(id);
  const deleteM = useDeleteCcDocument(id);

  // ---- Loading / not found ----
  if (appsQ.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="space-y-4">
        <PageHeader title="Application not found" />
        <p className="text-sm text-muted-foreground">
          The application may have been removed or you don't have access.
        </p>
        <Link
          href="/credit-cards"
          className={buttonVariants({ variant: "outline" })}
        >
          Back to Applications
        </Link>
      </div>
    );
  }

  const canEditDocs = isFd && app.status === DOC_EDITABLE_STATUS;

  const TypeIcon = isFd ? Landmark : CreditCardIcon;
  const typeAccent = isFd
    ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
    : "bg-blue-500/10 text-blue-600 dark:text-blue-400";

  const docItems = checklistQ.data?.checklist ?? [
    {
      doc_type: "aadhaar" as const,
      label: "Aadhaar Card",
      path: app.aadhaar_doc_path,
      uploaded: Boolean(app.aadhaar_doc_path),
    },
    {
      doc_type: "pan" as const,
      label: "PAN Card",
      path: app.pan_doc_path,
      uploaded: Boolean(app.pan_doc_path),
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
      <div>
        <Link
          href="/credit-cards"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          ← Back to Applications
        </Link>
      </div>

      <PageHeader
        title={`Credit Card #${app.application_id}`}
        description={`${cardTypeLabel(app.card_type)} • Applied ${formatDate(app.created_at)}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={app.status} />
            {isAdmin && (
              <Button onClick={() => setStatusOpen(true)}>Update Status</Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Applicant card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Applicant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {getInitials(app.full_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {app.full_name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {app.phone}
                  </p>
                </div>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {app.email}
              </p>
            </CardContent>
          </Card>

          {/* Type card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Card Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeAccent}`}
                >
                  <TypeIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {cardTypeLabel(app.card_type)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isFd ? "Fixed Deposit backed" : "Standard unsecured card"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              {app.applied_from_office || app.agent_id == null ? (
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                >
                  <Building2 className="mr-1 h-3 w-3" />
                  Applied from Office
                </Badge>
              ) : (
                <div>
                  <p className="text-sm font-medium">{app.agent_name || "—"}</p>
                  {app.agent_email && (
                    <p className="text-xs text-muted-foreground">
                      {app.agent_email}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Applicant Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Row label="Full Name" value={app.full_name} />
              <Row label="Phone" value={app.phone} />
              <Row label="Email" value={app.email} />
              <Row label="Pincode" value={app.pincode} />
              <Row label="Aadhaar" value={app.aadhaar_number} />
              <Row label="PAN" value={app.pan_number} />
              {app.notes && (
                <div className="md:col-span-2">
                  <Row label="Notes" value={app.notes} />
                </div>
              )}
              {isFd && app.fd_amount != null && (
                <Row label="FD Amount" value={formatCurrency(app.fd_amount)} />
              )}
            </CardContent>
          </Card>

          {/* Partner Bank */}
          {app.bank_name && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Partner Bank</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white">
                    {app.bank_logo_path ? (
                      <img
                        src={documentUrl(app.bank_logo_path) ?? ""}
                        alt={app.bank_name}
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <span className="font-bold text-blue-600">
                        {app.bank_name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{app.bank_name}</p>
                    {app.bank_short_code && (
                      <p className="text-xs text-muted-foreground">
                        {app.bank_short_code}
                      </p>
                    )}
                  </div>
                </div>

                {app.bank_target_audience && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Target Audience
                      </p>
                      <p className="whitespace-pre-line text-sm">
                        {app.bank_target_audience}
                      </p>
                    </div>
                  </>
                )}

                {app.bank_documents_required && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Documents Required
                      </p>
                      <p className="whitespace-pre-line text-sm">
                        {app.bank_documents_required}
                      </p>
                    </div>
                  </>
                )}

                {app.bank_apply_link && (
                  <a
                    href={app.bank_apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ className: "w-full" })}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Bank Application
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents — FD only */}
          {isFd && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Documents</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {uploadedCount} / {docItems.length} uploaded
                  </Badge>
                  {!canEditDocs && (
                    <Badge
                      variant="outline"
                      className="border-slate-500/30 bg-slate-500/10 text-[10px] text-muted-foreground"
                    >
                      Locked ({app.status})
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
                              title="View"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}

                          {canEditDocs && (
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

          {/* Non-FD notice */}
          {!isFd && (
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardContent className="flex gap-3 p-4">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    No document upload for standard cards
                  </p>
                  <p className="text-sm text-blue-700/80 dark:text-blue-400/80">
                    Documents are only required for FD-backed credit cards. For
                    this application, complete the process on the bank's site.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {isAdmin && (
        <UpdateCCStatusModal
          applicationId={app.application_id}
          customerName={app.full_name}
          currentStatus={app.status}
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
