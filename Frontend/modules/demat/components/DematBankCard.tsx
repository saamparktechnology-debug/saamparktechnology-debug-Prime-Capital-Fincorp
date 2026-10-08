// modules/demat/components/DematBankCard.tsx
"use client";

import { ArrowRight, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { documentUrl } from "@/lib/format";
import type { DematBank } from "../types";

export function DematBankCard({
  bank,
  onClick,
}: {
  bank: DematBank;
  onClick: () => void;
}) {
  const logo = documentUrl(bank.logo_path);

  // Debug — remove after fixing
  console.log("[DematBankCard]", bank.bank_id, bank.bank_name, {
    logo_path: bank.logo_path,
    computed_logo: logo,
  });

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!bank.is_active}
      className="group relative flex flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-950"
    >
      {/* Logo area */}
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:from-slate-900 dark:to-slate-800">
        {logo ? (
          <img
            src={logo}
            alt={bank.bank_name}
            crossOrigin="anonymous"
            className="h-20 max-w-full object-contain"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 text-2xl font-bold text-blue-600">
            {bank.bank_name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-muted-foreground">
            #{bank.bank_id}
          </p>
          {bank.is_active ? (
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            >
              ACTIVE
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-slate-500/30 bg-slate-500/10"
            >
              INACTIVE
            </Badge>
          )}
        </div>

        <div>
          <p className="truncate text-lg font-semibold">{bank.bank_name}</p>
          {bank.tagline && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {bank.tagline}
            </p>
          )}
          {bank.short_code && (
            <p className="mt-1 text-xs text-muted-foreground">
              {bank.short_code} • Demat
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" />
            Open Online
          </span>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-transform group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </button>
  );
}
