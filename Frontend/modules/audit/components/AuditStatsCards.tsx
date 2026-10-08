// modules/audit/components/AuditStatsCards.tsx
"use client";

import { useMemo } from "react";
import { Activity, Calendar, Users, Zap, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import type { AuditLog } from "../types";

interface Stat {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent: "blue" | "emerald" | "violet" | "amber";
}

const ACCENTS = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function AuditStatsCards({
  data,
  loading,
}: {
  data: AuditLog[] | undefined;
  loading?: boolean;
}) {
  const stats = useMemo<Stat[]>(() => {
    if (!data) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = data.filter(
      (l) => new Date(l.created_at).getTime() >= today.getTime(),
    ).length;

    // Most active actor
    const actorCounts = new Map<string, number>();
    data.forEach((l) => {
      const key = `${l.actor_type}#${l.actor_id}`;
      actorCounts.set(key, (actorCounts.get(key) ?? 0) + 1);
    });
    let topActor = "—";
    let topActorCount = 0;
    actorCounts.forEach((count, key) => {
      if (count > topActorCount) {
        topActorCount = count;
        topActor = key;
      }
    });
    const [actorType, actorId] = topActor.split("#");

    // Most common action
    const actionCounts = new Map<string, number>();
    data.forEach((l) => {
      actionCounts.set(l.action, (actionCounts.get(l.action) ?? 0) + 1);
    });
    let topAction = "—";
    let topActionCount = 0;
    actionCounts.forEach((count, action) => {
      if (count > topActionCount) {
        topActionCount = count;
        topAction = action;
      }
    });

    return [
      {
        label: "Total Entries",
        value: formatNumber(data.length),
        hint: "Last 500 records",
        icon: Activity,
        accent: "blue",
      },
      {
        label: "Today's Activity",
        value: formatNumber(todayCount),
        hint: "Since midnight",
        icon: Calendar,
        accent: "emerald",
      },
      {
        label: "Top Actor",
        value:
          topActor === "—"
            ? "—"
            : `${actorType === "admin" ? "Admin" : actorType === "agent" ? "Agent" : "System"} #${actorId}`,
        hint: `${topActorCount} action${topActorCount === 1 ? "" : "s"}`,
        icon: Users,
        accent: "violet",
      },
      {
        label: "Most Common",
        value: topAction,
        hint: `${topActionCount} time${topActionCount === 1 ? "" : "s"}`,
        icon: Zap,
        accent: "amber",
      },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-5">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.label} className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${ACCENTS[s.accent]}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
                <p className="mt-1 truncate text-lg font-semibold">{s.value}</p>
                {s.hint && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {s.hint}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
