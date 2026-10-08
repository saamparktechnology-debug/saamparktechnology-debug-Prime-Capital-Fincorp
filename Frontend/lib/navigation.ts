// lib/navigation.ts
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Banknote,
  CalendarClock,
  UserCog,
  Landmark,
  BarChart3,
  FileText,
  History,
  type LucideIcon,
  TrendingUp,
  CreditCard,
  PiggyBank,
  Briefcase,
  Layers,
} from "lucide-react";
import { ROLE, type Role } from "@/lib/constants/statuses";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
  badge?: "pending-kyc" | "upcoming-emi"; // for future live counts
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: [ROLE.ADMIN, ROLE.AGENT],
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Customers",
        href: "/customers",
        icon: Users,
        roles: [ROLE.ADMIN, ROLE.AGENT],
      },
      {
        label: "KYC",
        href: "/kyc",
        icon: ShieldCheck,
        roles: [ROLE.ADMIN, ROLE.AGENT],
        badge: "pending-kyc",
      },
      {
        label: "Loans",
        href: "/loans",
        icon: Banknote,
        roles: [ROLE.ADMIN, ROLE.AGENT],
      },
      {
        label: "Demat Accounts",
        href: "/demat",
        icon: TrendingUp,
        roles: [ROLE.ADMIN, ROLE.AGENT],
      },
      {
        label: "Credit Cards",
        href: "/credit-cards",
        icon: CreditCard,
        roles: [ROLE.ADMIN, ROLE.AGENT],
      },
      {
        label: "Savings Accounts",
        href: "/savings",
        icon: PiggyBank,
        roles: [ROLE.ADMIN, ROLE.AGENT],
      },
      // {
      //   label: "EMIs",
      //   href: "/emis",
      //   icon: CalendarClock,
      //   roles: [ROLE.ADMIN, ROLE.AGENT],
      //   badge: "upcoming-emi",
      // },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Agents",
        href: "/agents",
        icon: UserCog,
        roles: [ROLE.ADMIN],
      },
      {
        label: "Banks",
        href: "/banks",
        icon: Landmark,
        roles: [ROLE.ADMIN, ROLE.AGENT],
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        roles: [ROLE.ADMIN, ROLE.AGENT],
      },
      // {
      //   label: "Reports",
      //   href: "/reports",
      //   icon: FileText,
      //   roles: [ROLE.ADMIN],
      // },
      {
        label: "Audit Logs",
        href: "/audit-logs",
        icon: History,
        roles: [ROLE.ADMIN],
      },
    ],
  },
  // {
  //   title: "Masters",
  //   items: [
  //     {
  //       label: "Business Types",
  //       href: "/masters/business-types",
  //       icon: Briefcase,
  //       roles: [ROLE.ADMIN],
  //     },
  //     {
  //       label: "Business Categories",
  //       href: "/masters/business-categories",
  //       icon: Layers,
  //       roles: [ROLE.ADMIN],
  //     },
  //   ],
  // },
  {
    title: "Account",
    items: [
      {
        label: "Profile",
        href: "/profile",
        icon: UserCog, // or UserCircle
        roles: [ROLE.ADMIN, ROLE.AGENT],
      },
    ],
  },
];

/** Filter nav for a role */
export const getNavForRole = (role: Role | undefined): NavSection[] => {
  if (!role) return [];
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(role)),
  })).filter((section) => section.items.length > 0);
};
