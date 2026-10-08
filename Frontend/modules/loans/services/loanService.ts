// modules/loans/services/loanService.ts
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  Loan,
  CreateLoanPayload,
  UpdateLoanPayload,
  UpdateLoanStatusPayload,
  LoanStatusResponse,
} from "../types";

export const loanService = {
  async list(): Promise<Loan[]> {
    const res = await api.get(ENDPOINTS.LOANS.LIST);
    return unwrap<Loan[]>(res);
  },

  async create(payload: CreateLoanPayload): Promise<{
    loan_id: number;
    loan_status: string;
  }> {
    const res = await api.post(ENDPOINTS.LOANS.CREATE, payload);
    return unwrap(res);
  },

  async update(
    loanId: number | string,
    payload: UpdateLoanPayload,
  ): Promise<void> {
    await api.put(ENDPOINTS.LOANS.UPDATE(loanId), payload);
  },

  async updateStatus(
    loanId: number | string,
    payload: UpdateLoanStatusPayload,
  ): Promise<LoanStatusResponse> {
    const res = await api.patch(ENDPOINTS.LOANS.UPDATE_STATUS(loanId), payload);
    return unwrap<LoanStatusResponse>(res);
  },
};
