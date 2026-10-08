// modules/loans/types/index.ts
export type {
  Loan,
  CreateLoanPayload,
  UpdateLoanPayload,
  UpdateLoanStatusPayload,
  LoanStatusResponse,
} from "@/lib/types/loan";

export {
  LOAN_STATUS,
  LOAN_STATUS_LIST,
  LOAN_STATUS_EDITABLE_BY_AGENT,
  LOAN_TYPES,
} from "@/lib/constants/statuses";

export type { LoanStatus, LoanType } from "@/lib/constants/statuses";
