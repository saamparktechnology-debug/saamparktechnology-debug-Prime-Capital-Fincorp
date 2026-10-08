// modules/dashboard/components/QuickActionsGrid.tsx
"use client";

import Link from "next/link";
import {
  UserPlus,
  FileSpreadsheet,
  ShieldCheck,
  Wallet,
  BarChart3,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Action {
  label: string;
  href: string;
  icon: LucideIcon;
  accent: "blue" | "emerald" | "violet" | "amber" | "rose" | "cyan";
  adminOnly?: boolean;
}

const ACCENTS: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20",
  emerald:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20",
  violet:
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20",
  amber:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20",
};

export function QuickActionsGrid({ isAdmin }: { isAdmin: boolean }) {
  const actions: Action[] = [
    {
      label: "Add Customer",
      href: "/customers/new",
      icon: UserPlus,
      accent: "blue",
    },
    {
      label: "Create Loan",
      href: "/loans/new",
      icon: FileSpreadsheet,
      accent: "violet",
    },
    {
      label: "Review KYC",
      href: "/kyc",
      icon: ShieldCheck,
      accent: "amber",
    },
    {
      label: "View EMIs",
      href: "/emis",
      icon: Wallet,
      accent: "emerald",
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      accent: "cyan",
    },
    {
      label: "Manage Agents",
      href: "/agents",
      icon: UserCog,
      accent: "rose",
      adminOnly: true,
    },
  ];

  const visible = actions.filter((a) => !a.adminOnly || isAdmin);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {visible.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href + a.label}
                href={a.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-lg p-4 text-center transition-all hover:shadow-sm",
                  ACCENTS[a.accent],
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium leading-tight">
                  {a.label}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
