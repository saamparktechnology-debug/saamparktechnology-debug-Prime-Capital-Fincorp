// modules/reports/utils/export.ts
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ExportFormat = "csv" | "xlsx" | "pdf";

/**
 * Preferred column order per report type.
 * Columns not listed are appended at the end (in original order).
 */
const COLUMN_ORDER: Record<string, string[]> = {
  customers: [
    "customer_id",
    "first_name",
    "last_name",
    "primary_phone",
    "email_address",
    "kyc_status",
    "national_id_number",
    "current_city",
    "agent_name",
    "created_at",
  ],
  loans: [
    "loan_id",
    "customer_id",
    "first_name",
    "last_name",
    "primary_phone",
    "loan_type",
    "requested_amount",
    "approved_amount",
    "loan_status",
    "tenure_months",
    "interest_rate",
    "interest_type",
    "bank_name",
    "bank_reference_number",
    "agent_name",
    "purpose",
    "created_at",
  ],
  "loan-applications": [
    "loan_id",
    "customer_id",
    "first_name",
    "last_name",
    "primary_phone",
    "loan_type",
    "requested_amount",
    "approved_amount",
    "loan_status",
    "tenure_months",
    "interest_rate",
    "interest_type",
    "bank_name",
    "bank_reference_number",
    "agent_name",
    "purpose",
    "created_at",
  ],
  "approved-loans": [
    "loan_id",
    "first_name",
    "last_name",
    "primary_phone",
    "loan_type",
    "requested_amount",
    "approved_amount",
    "loan_status",
    "tenure_months",
    "interest_rate",
    "interest_type",
    "bank_name",
    "bank_reference_number",
    "agent_name",
    "created_at",
  ],
  "rejected-loans": [
    "loan_id",
    "first_name",
    "last_name",
    "primary_phone",
    "loan_type",
    "requested_amount",
    "loan_status",
    "rejection_reason",
    "agent_name",
    "created_at",
  ],
  disbursements: [
    "loan_id",
    "first_name",
    "last_name",
    "primary_phone",
    "loan_type",
    "approved_amount",
    "loan_status",
    "bank_name",
    "bank_reference_number",
    "agent_name",
    "created_at",
  ],
  collections: [
    "emi_id",
    "loan_id",
    "customer_id",
    "first_name",
    "last_name",
    "primary_phone",
    "installment_number",
    "emi_amount",
    "due_date",
    "status",
    "paid_date",
    "loan_type",
    "bank_name",
  ],
  overdue: [
    "emi_id",
    "loan_id",
    "customer_id",
    "first_name",
    "last_name",
    "primary_phone",
    "installment_number",
    "emi_amount",
    "due_date",
    "days_overdue",
    "aging_bucket",
    "status",
    "loan_type",
    "bank_name",
  ],
  outstanding: [
    "loan_id",
    "customer_id",
    "first_name",
    "last_name",
    "primary_phone",
    "loan_type",
    "approved_amount",
    "loan_status",
    "outstanding",
    "paid_so_far",
    "installments_left",
    "tenure_months",
    "interest_rate",
    "interest_type",
    "bank_name",
  ],
  "bank-disbursements": [
    "bank_id",
    "bank_name",
    "short_code",
    "loan_count",
    "total_disbursed",
    "active_outstanding",
    "pending_disbursement",
  ],
  "agent-performance": [
    "agent_id",
    "full_name",
    "email",
    "phone_number",
    "is_active",
    "total_customers",
    "kyc_approved",
    "kyc_pending",
    "total_loans",
    "portfolio_value",
    "total_collected",
  ],
  "kyc-pending": [
    "customer_id",
    "first_name",
    "last_name",
    "primary_phone",
    "email_address",
    "national_id_number",
    "days_pending",
    "agent_name",
    "created_at",
  ],
};

/**
 * Given rows + report type, return the ordered list of columns to display.
 */
export const orderedColumns = (
  rows: Record<string, unknown>[],
  reportType?: string,
): string[] => {
  const present = new Set<string>();
  rows.forEach((r) => Object.keys(r).forEach((k) => present.add(k)));

  const preferred = reportType ? (COLUMN_ORDER[reportType] ?? []) : [];
  const ordered: string[] = [];

  preferred.forEach((col) => {
    if (present.has(col)) {
      ordered.push(col);
      present.delete(col);
    }
  });

  // Append any remaining columns not in the preferred list
  present.forEach((col) => ordered.push(col));

  return ordered;
};

const formatCell = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const label = (key: string): string =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const exportToCSV = (
  rows: Record<string, unknown>[],
  filename: string,
  reportType?: string,
) => {
  const headers = orderedColumns(rows, reportType);
  const csvRows = [
    headers.map(label).join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const v = formatCell(r[h]);
          return `"${v.replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ];
  const csv = csvRows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
};

export const exportToExcel = (
  rows: Record<string, unknown>[],
  filename: string,
  reportType?: string,
) => {
  const headers = orderedColumns(rows, reportType);
  const displayRows = rows.map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h) => (obj[label(h)] = formatCell(r[h])));
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(displayRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = (
  rows: Record<string, unknown>[],
  filename: string,
  title: string,
  reportType?: string,
) => {
  const headers = orderedColumns(rows, reportType);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm" });

  doc.setFontSize(14);
  doc.text(title, 14, 15);
  doc.setFontSize(9);
  doc.text(
    `Generated on ${new Date().toLocaleString()}  •  ${rows.length} rows`,
    14,
    22,
  );

  autoTable(doc, {
    startY: 28,
    head: [headers.map(label)],
    body: rows.map((r) => headers.map((h) => formatCell(r[h]))),
    styles: { fontSize: 7, cellPadding: 1.5, overflow: "linebreak" },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 10, right: 10 },
    tableWidth: "auto",
  });

  doc.save(`${filename}.pdf`);
};

export const exportReport = (
  format: ExportFormat,
  rows: Record<string, unknown>[],
  filename: string,
  title: string,
  reportType?: string,
) => {
  if (rows.length === 0) return;
  if (format === "csv") return exportToCSV(rows, filename, reportType);
  if (format === "xlsx") return exportToExcel(rows, filename, reportType);
  if (format === "pdf") return exportToPDF(rows, filename, title, reportType);
};

// ---------- Helpers ----------
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
