// modules/reports/services/reportService.ts
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ReportFilters, ReportRow } from "../types";

export const reportService = {
  async fetch(
    reportType: string,
    filters: ReportFilters,
  ): Promise<{ report_type: string; count: number; data: ReportRow[] }> {
    // Build query string — skip empty values
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        params.append(k, String(v));
      }
    });
    const qs = params.toString();

    const res = await api.get(
      `${ENDPOINTS.REPORTS.FETCH(reportType)}${qs ? `?${qs}` : ""}`,
    );
    return res.data;
  },
};
