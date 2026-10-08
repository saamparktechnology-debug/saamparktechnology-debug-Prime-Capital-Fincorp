// components/layout/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useAuthStore } from "@/store/authStore";
import { useCompany } from "@/modules/agents/hooks/useCompany";
import { documentUrl } from "@/lib/format";
import { MobileNav } from "./MobileNav";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Welcome back" },
  "/customers": { title: "Customers", subtitle: "Manage customer records" },
  "/kyc": { title: "KYC", subtitle: "Documents and approvals" },
  "/loans": { title: "Loans", subtitle: "Applications and lifecycle" },
  "/demat": {
    title: "Demat Accounts",
    subtitle: "Open and track demat accounts",
  },
  "/credit-cards": {
    title: "Credit Cards",
    subtitle: "Track credit card applications",
  },
  "/savings": {
    title: "Savings Accounts",
    subtitle: "Track savings applications",
  },
  "/emis": { title: "EMIs", subtitle: "Repayments and reminders" },
  "/agents": { title: "Agents", subtitle: "Field officers management" },
  "/banks": { title: "Banks", subtitle: "Partner banks" },
  "/analytics": { title: "Analytics", subtitle: "Performance insights" },
  "/reports": { title: "Reports", subtitle: "Data exports" },
  "/audit-logs": { title: "Audit Logs", subtitle: "System activity" },
  "/profile": {
    title: "Profile & Settings",
    subtitle: "Manage your account",
  },
};

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: company } = useCompany();
  const logoUrl = company?.logo_path ? documentUrl(company.logo_path) : null;
  const companyName = company?.company_name || "BSA Microfinance";

  // Longest matching prefix wins
  const match = Object.keys(TITLES)
    .filter((k) => pathname === k || pathname.startsWith(k + "/"))
    .sort((a, b) => b.length - a.length)[0];

  const meta = match ? TITLES[match] : { title: "Dashboard", subtitle: "" };

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:px-6">
      {/* Left: mobile menu, mobile logo, page title */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile menu drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <MobileNav onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Mobile-only logo */}
        <Link href="/dashboard" className="md:hidden shrink-0">
          {logoUrl ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 p-1 shadow-sm ring-1 ring-white/10">
              <img
                src={logoUrl}
                alt={companyName}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              {companyName.slice(0, 2).toUpperCase()}
            </div>
          )}
        </Link>

        {/* Page title */}
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold md:text-lg">
            {meta.title}
          </h1>
          {meta.subtitle && (
            <p className="truncate text-xs text-muted-foreground">
              {meta.subtitle}
              {user?.fullName ? `, ${user.fullName}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Right: theme, notifications, user menu */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
        >
          <Bell className="h-5 w-5" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="gap-2 pl-1 pr-2 md:pr-3"
                aria-label="User menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-xs text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <div className="text-xs font-medium leading-tight">
                    {user?.fullName || "User"}
                  </div>
                  <div className="text-[10px] capitalize text-muted-foreground">
                    {user?.role}
                  </div>
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.fullName}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/profile" />}>
              <UserIcon className="mr-2 h-4 w-4" />
              Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
