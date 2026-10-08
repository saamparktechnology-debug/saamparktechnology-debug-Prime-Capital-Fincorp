// modules/audit/components/ActionBadge.tsx
"use client";

import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  LogIn,
  AlertTriangle,
  RefreshCw,
  Upload,
  Send,
  FileText,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Style {
  icon: React.ComponentType<{ className?: string }>;
  className: string;
  label?: string;
}

const STYLES: Record<string, Style> = {
  // Success (green)
  create: {
    icon: Plus,
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  approve: {
    icon: CheckCircle2,
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  upload: {
    icon: Upload,
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  // Info (blue)
  login: {
    icon: LogIn,
    className:
      "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  update: {
    icon: Pencil,
    className:
      "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  update_status: {
    icon: RefreshCw,
    className:
      "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  resubmit: {
    icon: RefreshCw,
    className:
      "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  generate_emis: {
    icon: FileText,
    className:
      "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  send_reminder: {
    icon: Send,
    className:
      "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  password_change: {
    icon: Zap,
    className:
      "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  // Danger (red)
  delete: {
    icon: Trash2,
    className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  },
  reject: {
    icon: XCircle,
    className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  },
  login_failed: {
    icon: AlertTriangle,
    className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  },
  otp_failed: {
    icon: AlertTriangle,
    className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  },
  password_change_failed: {
    icon: AlertTriangle,
    className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  },
};

export function ActionBadge({ action }: { action: string }) {
  const style = STYLES[action] ?? {
    icon: Pencil,
    className: "border-slate-500/30 bg-slate-500/10",
  };
  const Icon = style.icon;
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 whitespace-nowrap capitalize", style.className)}
    >
      <Icon className="h-3 w-3" />
      {action.replace(/_/g, " ")}
    </Badge>
  );
}
