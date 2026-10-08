// components/layout/MobileNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { getNavForRole } from "@/lib/navigation";
import { useCompany } from "@/modules/agents/hooks/useCompany";
import { documentUrl } from "@/lib/format";

export function MobileNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const sections = getNavForRole(user?.role);

  const { data: company } = useCompany();
  const logoUrl = company?.logo_path ? documentUrl(company.logo_path) : null;
  const companyName = company?.company_name || "Prime Capital Fincorp";
  const tagline = company?.tagline || "Better Credit, Brighter Future";

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        {logoUrl ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/95 p-1 shadow-sm ring-1 ring-white/10">
            <img
              src={logoUrl}
              alt={companyName}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Landmark className="h-4 w-4" />
          </div>
        )}
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold">{companyName}</span>
          {tagline && (
            <span className="truncate text-[10px] text-muted-foreground">
              {tagline}
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-4">
            {section.title && (
              <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </div>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
