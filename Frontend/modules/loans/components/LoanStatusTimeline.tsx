// modules/loans/components/LoanStatusTimeline.tsx
"use client";

import {
  Check,
  X,
  Clock,
  FileText,
  Send,
  ShieldCheck,
  Banknote,
  Activity,
  Flag,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LOAN_STATUS, type LoanStatus } from "../types";

const FLOW: LoanStatus[] = [
  LOAN_STATUS.DRAFT,
  LOAN_STATUS.APPLIED,
  LOAN_STATUS.UNDER_REVIEW,
  LOAN_STATUS.APPROVED,
  LOAN_STATUS.DISBURSED,
  LOAN_STATUS.ACTIVE,
  LOAN_STATUS.COMPLETED,
];

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Draft: FileText,
  Applied: Send,
  "Under Review": Clock,
  Approved: ShieldCheck,
  Disbursed: Banknote,
  Active: Activity,
  Completed: Flag,
  Rejected: X,
  Overdue: AlertCircle,
  Cancelled: X,
};

export function LoanStatusTimeline({ status }: { status: LoanStatus }) {
  // Terminal failure states
  if (status === LOAN_STATUS.REJECTED || status === LOAN_STATUS.CANCELLED) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-600">
          <X className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium">
            {status === LOAN_STATUS.REJECTED
              ? "Loan Rejected"
              : "Loan Cancelled"}
          </p>
          <p className="text-xs text-muted-foreground">
            This application is closed.
          </p>
        </div>
      </div>
    );
  }

  if (status === LOAN_STATUS.OVERDUE) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium">Loan Overdue</p>
          <p className="text-xs text-muted-foreground">
            One or more EMIs are past their due date.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(status);

  return (
    <div className="space-y-2">
      {FLOW.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        const Icon = ICONS[step] ?? Clock;

        return (
          <div key={step} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                  done && "border-emerald-500 bg-emerald-500 text-white",
                  current && "border-blue-500 bg-blue-500 text-white",
                  !done &&
                    !current &&
                    "border-muted-foreground/30 bg-background text-muted-foreground/50",
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              {i < FLOW.length - 1 && (
                <div
                  className={cn(
                    "my-1 h-6 w-0.5",
                    done ? "bg-emerald-500" : "bg-muted-foreground/20",
                  )}
                />
              )}
            </div>
            <div className="pt-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  !done && !current && "text-muted-foreground",
                )}
              >
                {step}
              </p>
              {current && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Current stage
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
