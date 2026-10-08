// modules/emis/services/emiService.ts
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { EMI, UpcomingEMI, EmiStatus } from "../types";

export const emiService = {
  async upcoming(): Promise<UpcomingEMI[]> {
    const res = await api.get(ENDPOINTS.EMIS.UPCOMING);
    return unwrap<UpcomingEMI[]>(res);
  },

  async byLoan(loanId: number | string): Promise<EMI[]> {
    const res = await api.get(ENDPOINTS.EMIS.BY_LOAN(loanId));
    return unwrap<EMI[]>(res);
  },

  async updateStatus(emiId: number | string, status: EmiStatus): Promise<void> {
    await api.patch(ENDPOINTS.EMIS.UPDATE_STATUS(emiId), { status });
  },

  async sendReminder(emiId: number | string): Promise<{ message: string }> {
    const res = await api.post(ENDPOINTS.EMIS.SEND_REMINDER(emiId));
    return unwrap(res);
  },
};
