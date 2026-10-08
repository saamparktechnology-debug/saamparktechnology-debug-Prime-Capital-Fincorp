// modules/credit-cards/components/CardTypeSelectionModal.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Landmark, CreditCard } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CARD_TYPES } from "../utils/cardTypes";

const ICONS = {
  fd: Landmark,
  normal: CreditCard,
};

const ACCENTS = {
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    ring: "hover:ring-violet-500/30",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    ring: "hover:ring-blue-500/30",
  },
};

export function CardTypeSelectionModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  const handleSelect = (type: string) => {
    onOpenChange(false);
    router.push(`/credit-cards/apply?type=${type}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose Credit Card Type</DialogTitle>
          <DialogDescription>
            Select the type of credit card application
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          {CARD_TYPES.map((ct) => {
            const Icon = ICONS[ct.value];
            const a = ACCENTS[ct.accent];
            return (
              <button
                key={ct.value}
                type="button"
                onClick={() => handleSelect(ct.value)}
                className={cn(
                  "group flex flex-col items-start gap-4 rounded-xl border bg-card p-6 text-left transition-all hover:shadow-md hover:ring-2",
                  a.ring,
                )}
              >
                <div className="flex w-full items-start justify-between">
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-xl",
                      a.bg,
                      a.text,
                    )}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  >
                    ACTIVE
                  </Badge>
                </div>

                <div className="flex-1">
                  <p className="text-base font-semibold">{ct.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ct.description}
                  </p>
                </div>

                <div className="flex w-full justify-end">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5",
                      a.bg,
                      a.text,
                    )}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
