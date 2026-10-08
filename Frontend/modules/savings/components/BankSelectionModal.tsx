// modules/savings/components/BankSelectionModal.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import { documentUrl } from "@/lib/format";

import { useSavingsBanks } from "../hooks/useSavings";

export function BankSelectionModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { data: banks, isLoading } = useSavingsBanks(true);

  const handleSelect = (bankId: number) => {
    onOpenChange(false);
    router.push(`/savings/apply?bank=${bankId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose a Partner Bank</DialogTitle>
          <DialogDescription>
            Select the bank to open a savings account with
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : !banks || banks.length === 0 ? (
          <EmptyState
            title="No partner banks"
            description="Admin must add savings banks before applications can be created."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {banks.map((bank) => {
              const logo = documentUrl(bank.logo_path);
              return (
                <button
                  key={bank.bank_id}
                  type="button"
                  onClick={() => handleSelect(bank.bank_id)}
                  className={cn(
                    "group flex items-center gap-4 rounded-xl border bg-card p-4 text-left transition-all",
                    "hover:border-blue-500/40 hover:bg-muted/40 hover:shadow-md",
                  )}
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white">
                    {logo ? (
                      <img
                        src={logo}
                        alt={bank.bank_name}
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-lg font-bold text-blue-600">
                        {bank.bank_name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold">
                      {bank.bank_name}
                    </p>
                    {bank.tagline && (
                      <p className="truncate text-xs text-muted-foreground">
                        {bank.tagline}
                      </p>
                    )}
                    {bank.short_code && (
                      <Badge variant="outline" className="mt-1 text-[10px]">
                        {bank.short_code}
                      </Badge>
                    )}
                  </div>

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
