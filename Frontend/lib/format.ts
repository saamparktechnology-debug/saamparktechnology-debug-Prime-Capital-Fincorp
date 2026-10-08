// lib/format.ts

export const formatCurrency = (
  value: number | string | null | undefined,
  currency = "INR",
): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (num === null || num === undefined || Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatNumber = (
  value: number | string | null | undefined,
): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (num === null || num === undefined || Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("en-IN").format(num);
};

export const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
};

export const formatDateTime = (
  value: string | Date | null | undefined,
): string => {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

export const getInitials = (name?: string): string => {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export const labelize = (value: string | null | undefined): string => {
  if (!value) return "";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

// ---------- Select options ----------
export interface SelectOption {
  value: string;
  tag: string;
}

export const optionTag = (
  options: SelectOption[],
  value: string | number | null | undefined,
): string | undefined => {
  if (value === null || value === undefined) return undefined;
  return options.find((o) => o.value === String(value))?.tag;
};

// ---------- Document URL builder ----------
/**
 * Build a full URL for a document stored on the backend.
 * Handles both:
 *   - relative paths:     "documents/xyz.jpeg"
 *   - Windows absolute:   "D:\...\uploads\documents\xyz.jpeg"
 *   - Linux absolute:     "/home/.../uploads/documents/xyz.jpeg"
 */
export const documentUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  const serverRoot = API_BASE.replace(/\/api\/v1\/?$/, "");

  const normalized = path.replace(/\\/g, "/");
  const clean = normalized.includes("uploads/")
    ? normalized.split("uploads/").pop()!.replace(/^\/+/, "")
    : normalized.replace(/^\/+/, "");

  return `${serverRoot}/uploads/${clean}`;
};
