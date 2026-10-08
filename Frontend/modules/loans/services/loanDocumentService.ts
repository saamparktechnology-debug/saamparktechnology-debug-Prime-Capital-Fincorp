// modules/loans/services/loanDocumentService.ts
import { api, unwrap } from "@/lib/api/client";

const LOANS_BASE = "/loans";

export interface DocumentChecklistItem {
  doc_type: "aadhaar" | "pan" | "business_reg" | "bank_statement";
  label: string;
  path: string | null;
  uploaded: boolean;
}

export interface DocumentChecklist {
  loan_id: number;
  loan_type: string;
  loan_status: string;
  checklist: DocumentChecklistItem[];
  all_uploaded: boolean;
  uploaded_count: number;
  total_required: number;
}

export const loanDocumentService = {
  async getChecklist(loanId: number | string): Promise<DocumentChecklist> {
    const res = await api.get(`${LOANS_BASE}/${loanId}/documents/status`);
    return unwrap<DocumentChecklist>(res);
  },

  async upload(
    loanId: number | string,
    docType: string,
    file: File,
  ): Promise<{ doc_type: string; file_path: string }> {
    const formData = new FormData();
    formData.append("document", file);
    const res = await api.post(
      `${LOANS_BASE}/${loanId}/documents/${docType}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return unwrap(res);
  },

  async remove(loanId: number | string, docType: string): Promise<void> {
    await api.delete(`${LOANS_BASE}/${loanId}/documents/${docType}`);
  },
};
