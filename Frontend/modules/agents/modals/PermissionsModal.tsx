// modules/agents/modals/PermissionsModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

import { useAgentPermissions, useUpdatePermissions } from "../hooks/useAgents";
import { MODULES, type AgentPermission } from "@/lib/constants/permissions";
import type { Agent } from "../types";

const MODULE_LIST = [
  MODULES.CUSTOMERS,
  MODULES.KYC,
  MODULES.LOANS,
  MODULES.REPORTS,
];

const ACTIONS = [
  { key: "can_create", label: "Create" },
  { key: "can_read", label: "Read" },
  { key: "can_update", label: "Update" },
  { key: "can_delete", label: "Delete" },
] as const;

type ActionKey = (typeof ACTIONS)[number]["key"];

const DEFAULTS: AgentPermission[] = MODULE_LIST.map((m) => ({
  module_name: m,
  can_create: true,
  can_read: true,
  can_update: true,
  can_delete: false,
}));

export function PermissionsModal({
  open,
  onOpenChange,
  agent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
}) {
  const { data, isLoading } = useAgentPermissions(agent?.agent_id);
  const updateM = useUpdatePermissions(agent?.agent_id);

  const [permissions, setPermissions] = useState<AgentPermission[]>(DEFAULTS);

  useEffect(() => {
    if (open && data) {
      const map = new Map(data.map((p) => [p.module_name, p]));
      const merged = MODULE_LIST.map(
        (m) => map.get(m) ?? DEFAULTS.find((d) => d.module_name === m)!,
      );
      setPermissions(merged);
    }
  }, [open, data]);

  const toggle = (module_name: string, key: ActionKey, value: boolean) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.module_name === module_name ? { ...p, [key]: value } : p,
      ),
    );
  };

  const getPerm = (module_name: string) =>
    permissions.find((p) => p.module_name === module_name) ?? {
      module_name,
      can_create: false,
      can_read: false,
      can_update: false,
      can_delete: false,
    };

  const onSubmit = () => {
    updateM.mutate({ permissions }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Permissions — {agent?.full_name ?? "Agent"}</DialogTitle>
          <DialogDescription>
            Toggle module access. Changes apply immediately.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  {ACTIONS.map((a) => (
                    <TableHead key={a.key} className="text-center">
                      {a.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {MODULE_LIST.map((mod) => {
                  const perm = getPerm(mod);
                  return (
                    <TableRow key={mod}>
                      <TableCell className="font-medium capitalize">
                        {mod}
                      </TableCell>
                      {ACTIONS.map((a) => (
                        <TableCell key={a.key} className="text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={perm[a.key]}
                              onCheckedChange={(v) =>
                                toggle(mod, a.key, Boolean(v))
                              }
                            />
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateM.isPending}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={updateM.isPending || isLoading}>
            {updateM.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Permissions"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
