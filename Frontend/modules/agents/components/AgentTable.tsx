// modules/agents/components/AgentTable.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, MoreHorizontal, Settings, Power, Eye } from "lucide-react";
import { CreditCard } from "lucide-react";
import { AgentIdCardModal } from "./AgentIdCardModal";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatDate } from "@/lib/format";
import type { Agent } from "../types";
import { useToggleAgentStatus } from "../hooks/useAgents";

export function AgentTable({
  data,
  loading,
  onManagePermissions,
}: {
  data: Agent[] | undefined;
  loading?: boolean;
  onManagePermissions: (agent: Agent) => void;
}) {
  const [search, setSearch] = useState("");
  const [toggleTarget, setToggleTarget] = useState<Agent | null>(null);
  const toggleM = useToggleAgentStatus();
  const [idCardTarget, setIdCardTarget] = useState<Agent | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (a) =>
        a.full_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone_number.includes(q),
    );
  }, [data, search]);

  const confirmToggle = () => {
    if (!toggleTarget) return;
    toggleM.mutate(
      { id: toggleTarget.agent_id, is_active: !toggleTarget.is_active },
      { onSettled: () => setToggleTarget(null) },
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search name, email, or phone..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border bg-card">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No agents found"
            description={
              search
                ? "Try adjusting your search."
                : "Create your first field agent to begin."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.agent_id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">
                      <Link
                        href={`/agents/${a.agent_id}`}
                        className="hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                      >
                        {a.full_name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {a.email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {a.phone_number}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={a.is_active ? "Active" : "Inactive"}
                        variant={a.is_active ? "success" : "neutral"}
                      />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {formatDate(a.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            render={<Link href={`/agents/${a.agent_id}`} />}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setIdCardTarget(a)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Download ID Card
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onManagePermissions(a)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Manage permissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setToggleTarget(a)}
                            className={
                              a.is_active
                                ? "text-destructive focus:text-destructive"
                                : ""
                            }
                          >
                            <Power className="mr-2 h-4 w-4" />
                            {a.is_active ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {data?.length ?? 0} agents
        </p>
      )}

      <ConfirmDialog
        open={Boolean(toggleTarget)}
        onOpenChange={(o) => !o && setToggleTarget(null)}
        title={
          toggleTarget?.is_active ? "Deactivate agent?" : "Activate agent?"
        }
        description={
          toggleTarget?.is_active
            ? `${toggleTarget.full_name} will lose access to the system immediately.`
            : `${toggleTarget?.full_name} will regain access to the system.`
        }
        confirmText={toggleTarget?.is_active ? "Deactivate" : "Activate"}
        variant={toggleTarget?.is_active ? "destructive" : "default"}
        onConfirm={confirmToggle}
        loading={toggleM.isPending}
      />
      {idCardTarget && (
        <AgentIdCardModal
          agentId={idCardTarget.agent_id}
          open={Boolean(idCardTarget)}
          onOpenChange={(o) => !o && setIdCardTarget(null)}
        />
      )}
    </div>
  );
}
