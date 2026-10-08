// modules/audit/components/AuditLogTable.tsx
"use client";

import { Fragment, useMemo, useState } from "react";
import { Search, Filter, ChevronDown, ChevronRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import {
  formatDateTime,
  getInitials,
  type SelectOption,
  optionTag,
} from "@/lib/format";
import type { AuditLog } from "../types";
import { ActionBadge } from "./ActionBadge";

const tryParseJSON = (val: string | null | undefined): any => {
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
};

const ACTOR_OPTIONS: SelectOption[] = [
  { value: "all", tag: "All Actors" },
  { value: "admin", tag: "Admin" },
  { value: "agent", tag: "Agent" },
  { value: "system", tag: "System" },
];

export function AuditLogTable({
  data,
  loading,
}: {
  data: AuditLog[] | undefined;
  loading?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [actorFilter, setActorFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const entityOptions = useMemo<SelectOption[]>(() => {
    if (!data) return [{ value: "all", tag: "All Entities" }];
    const set = new Set<string>();
    data.forEach((l) => l.target_entity && set.add(l.target_entity));
    return [
      { value: "all", tag: "All Entities" },
      ...Array.from(set)
        .sort()
        .map((e) => ({ value: e, tag: e })),
    ];
  }, [data]);

  const actionOptions = useMemo<SelectOption[]>(() => {
    if (!data) return [{ value: "all", tag: "All Actions" }];
    const set = new Set<string>();
    data.forEach((l) => l.action && set.add(l.action));
    return [
      { value: "all", tag: "All Actions" },
      ...Array.from(set)
        .sort()
        .map((a) => ({
          value: a,
          tag: a.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        })),
    ];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.filter((log) => {
      if (actionFilter !== "all" && log.action !== actionFilter) return false;
      if (actorFilter !== "all" && log.actor_type !== actorFilter) return false;
      if (entityFilter !== "all" && log.target_entity !== entityFilter)
        return false;
      if (!q) return true;
      return (
        log.action?.toLowerCase().includes(q) ||
        log.target_entity?.toLowerCase().includes(q) ||
        String(log.actor_id).includes(q) ||
        String(log.target_id).includes(q)
      );
    });
  }, [data, search, actionFilter, actorFilter, entityFilter]);

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search action, entity, or IDs..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />

          <Select
            value={actorFilter}
            onValueChange={(v) => setActorFilter(v ?? "all")}
          >
            <SelectTrigger className="w-[140px]">
              <span>
                {optionTag(ACTOR_OPTIONS, actorFilter) ?? "All Actors"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {ACTOR_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={actionFilter}
            onValueChange={(v) => setActionFilter(v ?? "all")}
          >
            <SelectTrigger className="w-[150px]">
              <span>
                {optionTag(actionOptions, actionFilter) ?? "All Actions"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {actionOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={entityFilter}
            onValueChange={(v) => setEntityFilter(v ?? "all")}
          >
            <SelectTrigger className="w-[140px]">
              <span>
                {optionTag(entityOptions, entityFilter) ?? "All Entities"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {entityOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        {loading ? (
          <TableSkeleton rows={10} cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No audit logs"
            description={
              search ||
              actionFilter !== "all" ||
              actorFilter !== "all" ||
              entityFilter !== "all"
                ? "Try adjusting your filters."
                : "Activity will appear here once actions are performed."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead className="hidden md:table-cell">Target</TableHead>
                  <TableHead className="hidden lg:table-cell">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log) => {
                  const isOpen = expandedId === log.audit_id;
                  const hasDetail = log.old_value || log.new_value;
                  return (
                    <Fragment key={log.audit_id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() =>
                          setExpandedId(isOpen ? null : log.audit_id)
                        }
                      >
                        <TableCell className="w-8 pl-2">
                          {hasDetail ? (
                            isOpen ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )
                          ) : null}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDateTime(log.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback
                                className={
                                  log.actor_type === "admin"
                                    ? "bg-violet-600 text-[10px] text-white"
                                    : log.actor_type === "agent"
                                      ? "bg-emerald-600 text-[10px] text-white"
                                      : "bg-slate-600 text-[10px] text-white"
                                }
                              >
                                {getInitials(log.actor_name || log.actor_type)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="truncate text-xs font-medium">
                                {log.actor_name ||
                                  (log.actor_type === "system"
                                    ? "System"
                                    : `#${log.actor_id}`)}
                              </span>
                              <span className="truncate text-[10px] text-muted-foreground capitalize">
                                {log.actor_type} #{log.actor_id}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <ActionBadge action={log.action} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {log.target_entity}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          #{log.target_id}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {log.ip_address || "—"}
                        </TableCell>
                      </TableRow>

                      {/* Expanded detail row */}
                      {isOpen && hasDetail && (
                        <TableRow className="bg-muted/20 hover:bg-muted/20">
                          <TableCell></TableCell>
                          <TableCell colSpan={6} className="py-3">
                            <div className="grid gap-4 md:grid-cols-2">
                              {log.old_value && (
                                <div>
                                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Before
                                  </p>
                                  <pre className="overflow-x-auto rounded-lg border bg-background p-3 text-xs">
                                    {JSON.stringify(
                                      tryParseJSON(log.old_value),
                                      null,
                                      2,
                                    )}
                                  </pre>
                                </div>
                              )}
                              {log.new_value && (
                                <div>
                                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    After
                                  </p>
                                  <pre className="overflow-x-auto rounded-lg border bg-background p-3 text-xs">
                                    {JSON.stringify(
                                      tryParseJSON(log.new_value),
                                      null,
                                      2,
                                    )}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {data?.length ?? 0} audit records
        </p>
      )}
    </div>
  );
}
