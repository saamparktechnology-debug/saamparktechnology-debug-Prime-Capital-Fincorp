// modules/agents/AgentDetail.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAgentDetail } from "./hooks/useAgents";
import { AgentProfileCard } from "./components/AgentProfileCard";
import { AgentStatsCards, buildAgentStats } from "./components/AgentStatsCards";
import { AdminAgentKycPanel } from "./components/AdminAgentKycPanel";

import { useAgentSummary } from "./hooks/useAgents";
import { KycDonut } from "@/modules/analytics/components/KycDonut";
import { LoanStatusBar } from "@/modules/analytics/components/LoanStatusBar";
import { CollectionsDonut } from "@/modules/analytics/components/CollectionsDonut";

export default function AgentDetail() {
  const params = useParams<{ id: string }>();
  const agentId = params?.id;

  const agentQ = useAgentDetail(agentId);
  const summaryQ = useAgentSummary(agentId);

  if (agentQ.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!agentQ.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Agent not found" />
        <EmptyState
          title="Agent not found"
          description="The agent may have been removed."
          action={
            <Link href="/agents" className={buttonVariants()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Agents
            </Link>
          }
        />
      </div>
    );
  }

  const agent = agentQ.data;
  const summary = summaryQ.data;
  const stats = buildAgentStats(summary);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/agents"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Agents
        </Link>
      </div>

      <PageHeader
        title={agent.full_name}
        description={`Agent #${agent.agent_id}`}
      />

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
        </TabsList>

        {/* ---------- Overview ---------- */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <AgentProfileCard agent={agent} />
          <AgentStatsCards stats={stats} loading={summaryQ.isLoading} />

          {summary && (
            <div className="grid gap-4 lg:grid-cols-2">
              <KycDonut
                data={summary.metrics.customers as any}
                loading={summaryQ.isLoading}
              />
              <LoanStatusBar
                data={summary.metrics.loans as any}
                loading={summaryQ.isLoading}
              />
              <div className="lg:col-span-2">
                <CollectionsDonut
                  data={summary.metrics.collections as any}
                  loading={summaryQ.isLoading}
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* ---------- KYC ---------- */}
        <TabsContent value="kyc" className="mt-6">
          <AdminAgentKycPanel agentId={agent.agent_id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
