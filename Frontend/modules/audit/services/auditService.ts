// modules/audit/services/auditService.ts
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { AuditLog } from "../types";

export const auditService = {
  async list(): Promise<AuditLog[]> {
    const res = await api.get(ENDPOINTS.AUDIT.LIST);
    return unwrap<AuditLog[]>(res);
  },
};
