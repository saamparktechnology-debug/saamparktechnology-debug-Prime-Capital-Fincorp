// modules/agents/components/AdminAgentKycPanel.tsx
"use client";

import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

import { AgentKycStatusCard } from "./AgentKycStatusCard";
import { AgentKycForm } from "./AgentKycForm";
import { AgentDocumentsList } from "./AgentDocumentsList";
import { UploadAgentDocumentModal } from "../modals/UploadAgentDocumentModal";
import { ReviewAgentKycModal } from "../modals/ReviewAgentKycModal";

import {
  useAgentKyc,
  useUpdateAgentKyc,
  useAgentDocuments,
  useDeleteAgentDocument,
} from "../hooks/useAgentKyc";
import { KYC_STATUS } from "@/lib/constants/statuses";
import type { AgentDocument } from "../types";

export function AdminAgentKycPanel({ agentId }: { agentId: number }) {
  const { data, isLoading } = useAgentKyc(agentId);
  const docsQ = useAgentDocuments(agentId);
  const updateM = useUpdateAgentKyc(agentId);
  const deleteM = useDeleteAgentDocument(agentId);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AgentDocument | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data?.kyc) {
    return (
      <EmptyState
        title="KYC not initialized"
        description="No KYC record found for this agent."
      />
    );
  }

  const { kyc, agent } = data;

  return (
    <div className="space-y-6">
      <AgentKycStatusCard
        status={kyc.kyc_status}
        rejectionReason={kyc.kyc_rejection_reason}
        canReview
        onReview={() => setReviewOpen(true)}
      />

      <AgentDocumentsList
        documents={docsQ.data}
        loading={docsQ.isLoading}
        canManage
        onUpload={() => setUploadOpen(true)}
        onDelete={(d) => setDeleteTarget(d)}
      />

      <AgentKycForm
        kyc={kyc}
        loading={updateM.isPending}
        onSubmit={(payload) => updateM.mutate(payload)}
      />

      <UploadAgentDocumentModal
        agentId={agentId}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />

      <ReviewAgentKycModal
        agentId={agentId}
        agentName={agent.full_name}
        open={reviewOpen}
        onOpenChange={setReviewOpen}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete document?"
        description={`Remove "${deleteTarget?.document_type}"? This cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        loading={deleteM.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteM.mutate(deleteTarget.document_id, {
            onSettled: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}
