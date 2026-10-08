// modules/profile/components/MyKycTab.tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

import { AgentKycForm } from "@/modules/agents/components/AgentKycForm";
import { AgentKycStatusCard } from "@/modules/agents/components/AgentKycStatusCard";
import { AgentDocumentsList } from "@/modules/agents/components/AgentDocumentsList";
import { UploadAgentDocumentModal } from "@/modules/agents/modals/UploadAgentDocumentModal";

import {
  useMyAgentKyc,
  useUpdateMyAgentKyc,
} from "@/modules/agents/hooks/useAgentKyc";
import { useAgentDocuments } from "@/modules/agents/hooks/useAgentKyc";
import { useAuthStore } from "@/store/authStore";
import { KYC_STATUS } from "@/lib/constants/statuses";

export function MyKycTab() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useMyAgentKyc();
  const docsQ = useAgentDocuments(user?.id);
  const updateM = useUpdateMyAgentKyc();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="KYC not initialized"
        description="Please contact admin to set up your KYC profile."
      />
    );
  }

  const canEdit = data.kyc_status !== KYC_STATUS.APPROVED;

  return (
    <div className="space-y-6">
      <AgentKycStatusCard
        status={data.kyc_status}
        rejectionReason={data.kyc_rejection_reason}
        canResubmit={false}
      />

      <AgentDocumentsList
        documents={docsQ.data}
        loading={docsQ.isLoading}
        canManage={false}
      />

      <AgentKycForm
        kyc={data}
        disabled={!canEdit}
        loading={updateM.isPending}
        onSubmit={(payload) => updateM.mutate(payload)}
      />
    </div>
  );
}
