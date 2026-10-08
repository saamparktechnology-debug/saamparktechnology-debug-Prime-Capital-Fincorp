// modules/analytics/AgentAnalyticsDetail.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useAgentSummary } from "./hooks/useAnalytics";
import { KycDonut } from "./components/KycDonut";
import { LoanStatusBar } from "./components/LoanStatusBar";
import { CollectionsDonut } from "./components/CollectionsDonut";
import { formatDate } from "@/lib/format";

export default function AgentAnalyticsDetail() {
  const params = useParams<{ agentId: string }>();
  const agentId = params?.agentId;

  const { data, isLoading } = useAgentSummary(agentId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <PageHeader title="Agent not found" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" render={<Link href="/analytics" />}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Agents
        </Button>
      </div>

      <PageHeader
        title={data.profile.full_name}
        description={`${data.profile.email} • ${data.profile.phone_number}`}
        action={
          <StatusBadge
            status={data.profile.is_active ? "Active" : "Inactive"}
            variant={data.profile.is_active ? "success" : "neutral"}
          />
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Info label="Full Name" value={data.profile.full_name} />
          <Info label="Email" value={data.profile.email} />
          <Info label="Phone" value={data.profile.phone_number} />
          <Info label="Joined" value={formatDate(data.profile.created_at)} />
          <Info
            label="Status"
            value={data.profile.is_active ? "Active" : "Inactive"}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <KycDonut data={data.metrics.customers} />
        <LoanStatusBar data={data.metrics.loans} />
        <div className="lg:col-span-2">
          <CollectionsDonut data={data.metrics.collections} />
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}
