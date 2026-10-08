// modules/agents/AgentList.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { AgentTable } from "./components/AgentTable";
import { AgentFormModal } from "./modals/AgentFormModal";
import { PermissionsModal } from "./modals/PermissionsModal";
import { useAgentsList } from "./hooks/useAgents";
import type { Agent } from "./types";

export default function AgentList() {
  const { data, isLoading } = useAgentsList();

  const [createOpen, setCreateOpen] = useState(false);
  const [permTarget, setPermTarget] = useState<Agent | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        description="Manage field officers and their permissions"
        action={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className={buttonVariants()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </button>
        }
      />

      <AgentTable
        data={data}
        loading={isLoading}
        onManagePermissions={setPermTarget}
      />

      <AgentFormModal open={createOpen} onOpenChange={setCreateOpen} />

      <PermissionsModal
        open={Boolean(permTarget)}
        onOpenChange={(o) => !o && setPermTarget(null)}
        agent={permTarget}
      />
    </div>
  );
}
