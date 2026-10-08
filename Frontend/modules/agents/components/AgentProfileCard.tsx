// modules/agents/components/AgentProfileCard.tsx
"use client";

import { Mail, Phone, Calendar, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials, formatDate } from "@/lib/format";
import type { Agent } from "../types";

export function AgentProfileCard({ agent }: { agent: Agent }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 pb-3">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-emerald-600 text-lg font-semibold text-white">
            {getInitials(agent.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-xl">{agent.full_name}</CardTitle>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              <Shield className="mr-1 h-3 w-3" />
              Agent
            </Badge>
            <Badge
              variant="outline"
              className={
                agent.is_active
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-slate-500/30 bg-slate-500/10"
              }
            >
              {agent.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <InfoRow icon={Mail} label="Email" value={agent.email} />
        <InfoRow icon={Phone} label="Phone" value={agent.phone_number} />
        <InfoRow
          icon={Calendar}
          label="Joined"
          value={formatDate(agent.created_at)}
        />
        <InfoRow icon={Shield} label="Agent ID" value={`#${agent.agent_id}`} />
      </CardContent>
    </Card>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
