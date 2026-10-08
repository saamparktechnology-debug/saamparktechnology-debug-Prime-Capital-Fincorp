"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LOAN_TYPE_CATALOG, type LoanTypeMeta } from "@/lib/constants/statuses";

const ACCENTS: Record<
  LoanTypeMeta["accent"],
  {
    bg: string;
    text: string;
    border: string;
    ring: string;
    gradient: string;
  }
> = {
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    ring: "hover:ring-blue-500/20",
    gradient: "from-blue-500/10",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    ring: "hover:ring-emerald-500/20",
    gradient: "from-emerald-500/10",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/20",
    ring: "hover:ring-violet-500/20",
    gradient: "from-violet-500/10",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    ring: "hover:ring-amber-500/20",
    gradient: "from-amber-500/10",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    ring: "hover:ring-rose-500/20",
    gradient: "from-rose-500/10",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/20",
    ring: "hover:ring-cyan-500/20",
    gradient: "from-cyan-500/10",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/20",
    ring: "hover:ring-orange-500/20",
    gradient: "from-orange-500/10",
  },
};

export function LoanTypeSelectionModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  const handleSelect = (loanType: LoanTypeMeta) => {
    onOpenChange(false);

    router.push(`/loans/new?type=${encodeURIComponent(loanType.name)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto",
          "border-border/60 bg-background p-0 shadow-2xl",
          "sm:max-w-4xl",
        )}
      >
        <div className="border-b px-6 py-2">
          <DialogHeader className="space-y-0.5">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Choose a Loan Product
            </DialogTitle>

            <DialogDescription className="text-xs">
              Select a loan product to start a new application.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-5 py-2">
          <div className="grid gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {LOAN_TYPE_CATALOG.map((lt) => {
              const a = ACCENTS[lt.accent];
              const Icon = lt.icon;

              return (
                <button
                  key={lt.id}
                  type="button"
                  onClick={() => handleSelect(lt)}
                  className={cn(
                    "group flex flex-col rounded-xl border bg-card p-3.5 text-left",
                    "transition-all duration-200",
                    "hover:-translate-y-0.5 hover:shadow-md hover:ring-2",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-primary focus-visible:ring-offset-2",
                    a.ring,
                  )}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg",
                        "border",
                        a.bg,
                        a.border,
                        "transition-transform duration-200 group-hover:scale-105",
                      )}
                    >
                      <Icon
                        className={cn("h-[30px] w-[30px]", a.text)}
                        strokeWidth={1.8}
                      />
                    </div>

                    <Badge
                      variant="secondary"
                      className={cn(
                        "h-5 gap-1 rounded-full px-1.5",
                        "text-[10px] font-semibold uppercase tracking-wide",
                        a.bg,
                        a.text,
                        "border-0",
                      )}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="mt-2.5">
                    <div className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
                      <span>#{lt.id}</span>
                      <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />
                      <span>{lt.code}</span>
                    </div>

                    <h3 className="mt-0.5 text-lg font-semibold leading-5 tracking-tight">
                      {lt.name}
                    </h3>

                    <p className="mt-0.5 line-clamp-1 text-[11px] leading-4 text-muted-foreground">
                      {lt.description}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="mt-2.5 flex items-center justify-between border-t pt-2.5">
                    <span className="text-[10px] font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                      Start application
                    </span>

                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full",
                        "border transition-transform duration-200",
                        "group-hover:translate-x-0.5",
                        a.bg,
                        a.border,
                        a.text,
                      )}
                    >
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
