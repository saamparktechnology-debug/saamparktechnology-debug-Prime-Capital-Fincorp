// components/layout/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { getNavForRole, type NavItem } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCompany } from "@/modules/agents/hooks/useCompany";
import { documentUrl } from "@/lib/format";

const STORAGE_KEY = "bsa-sidebar-collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data: company } = useCompany();
  const logoUrl = company?.logo_path ? documentUrl(company.logo_path) : null;
  const companyName = company?.company_name || "BSA Microfinance";
  const tagline = company?.tagline || "Better Credit, Brighter Future";

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  if (!mounted) return null;

  const sections = getNavForRole(user?.role);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out md:flex",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-2" : "justify-between px-3",
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            "flex min-w-0 items-center",
            collapsed ? "gap-0" : "gap-2.5",
          )}
        >
          {/* Logo image with light backdrop — or fallback icon */}
          {logoUrl ? (
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-lg bg-white/95 p-1 shadow-sm ring-1 ring-white/10 transition-all",
                collapsed ? "h-10 w-15" : "h-16 w-48",
              )}
            >
              <img
                src={logoUrl}
                alt={companyName}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white",
                collapsed ? "h-9 w-9" : "h-10 w-10",
              )}
            >
              <Landmark className="h-4 w-4" />
            </div>
          )}

          {/* {!collapsed && (
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold">
                {companyName}
              </span>
              {tagline && (
                <span className="truncate text-[10px] text-muted-foreground">
                  {tagline}
                </span>
              )}
            </div>
          )} */}
        </Link>

        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-7 w-7 shrink-0"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-4">
            {section.title && !collapsed && (
              <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </div>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/")
                  }
                  collapsed={collapsed}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle (when collapsed) */}
      {collapsed && (
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-9 w-full"
            aria-label="Expand sidebar"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </Button>
        </div>
      )}

      {/* Footer */}
      <div
        className={cn(
          "border-t border-sidebar-border px-3 py-3 text-[10px] text-muted-foreground",
          collapsed && "text-center",
        )}
      >
        {collapsed ? "v1.0" : `${companyName} • v1.0.0`}
      </div>
    </aside>
  );
}

function SidebarLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const link = (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <li>
        <Tooltip>
          <TooltipTrigger render={link} />
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      </li>
    );
  }

  return <li>{link}</li>;
}
