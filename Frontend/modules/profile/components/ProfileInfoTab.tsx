// modules/profile/components/ProfileInfoTab.tsx
"use client";

import { Mail, User as UserIcon, Shield, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { getInitials } from "@/lib/format";

export function ProfileInfoTab() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [copied, setCopied] = useState(false);

  const copyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-3">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-blue-600 text-lg font-semibold text-white">
              {getInitials(user?.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{user?.fullName}</CardTitle>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                <Shield className="mr-1 h-3 w-3" />
                {user?.role}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <InfoRow icon={Mail} label="Email" value={user?.email ?? "—"} />
          <InfoRow
            icon={UserIcon}
            label="User ID"
            value={String(user?.id ?? "—")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
            Session Token
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Your JWT access token for this session. Valid for 8 hours. Do not
            share it.
          </p>
          <div className="flex items-start gap-2">
            <div className="flex-1 break-all rounded-lg border bg-muted/40 p-3 font-mono text-xs">
              {token ? `${token.slice(0, 40)}...` : "No active token"}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToken}
              disabled={!token}
              aria-label="Copy token"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
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
