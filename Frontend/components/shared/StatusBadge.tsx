// components/shared/StatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Variant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "default";

const VARIANTS: Record<Variant, string> = {
  success:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  warning:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  danger: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  info: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  neutral:
    "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
  default: "",
};

export function StatusBadge({
  status,
  variant,
  className,
}: {
  status: string;
  variant?: Variant;
  className?: string;
}) {
  const resolved: Variant = variant ?? inferVariant(status);
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-xs font-medium",
        VARIANTS[resolved],
        className,
      )}
    >
      {status}
    </Badge>
  );
}

function inferVariant(status: string): Variant {
  const s = status.toLowerCase();
  if (["approved", "paid", "active", "disbursed", "completed"].includes(s))
    return "success";
  if (["pending", "under review", "applied", "draft"].includes(s))
    return "warning";
  if (["rejected", "overdue", "cancelled"].includes(s)) return "danger";
  return "neutral";
}
