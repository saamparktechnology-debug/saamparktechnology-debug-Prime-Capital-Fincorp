// lib/api/endpoints.ts

/**
 * Single source of truth for all backend API paths.
 * Base URL comes from NEXT_PUBLIC_API_URL (see lib/config/env.ts).
 */

export const ENDPOINTS = {
  // ---------- Auth ----------
  AUTH: {
    LOGIN: "/auth/login",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  // ---------- Customers ----------
  CUSTOMERS: {
    LIST: "/customers",
    CREATE: "/customers",
    DETAIL: (id: number | string) => `/customers/${id}`,
  },

  COMPANY: {
    GET: "/company",
    UPDATE: "/company",
    UPLOAD_LOGO: "/company/logo",
  },

  // ---------- KYC ----------
  KYC: {
    REVIEW: (customerId: number | string) => `/kyc/${customerId}/review`,
    RESUBMIT: (customerId: number | string) => `/kyc/${customerId}/resubmit`,
    UPLOAD_DOCUMENT: (customerId: number | string) =>
      `/kyc/${customerId}/documents`,
    LIST_DOCUMENTS: (customerId: number | string) =>
      `/kyc/${customerId}/documents`,
    DELETE_DOCUMENT: (
      customerId: number | string,
      documentId: number | string,
    ) => `/kyc/${customerId}/documents/${documentId}`,
  },

  // ---------- Loans ----------
  LOANS: {
    LIST: "/loans",
    CREATE: "/loans",
    UPDATE: (loanId: number | string) => `/loans/${loanId}`,
    UPDATE_STATUS: (loanId: number | string) => `/loans/${loanId}/status`,
  },
  DEMAT: {
    BANKS: {
      LIST: "/demat/banks",
      DETAIL: (id: number | string) => `/demat/banks/${id}`,
      CREATE: "/demat/banks",
      UPDATE: (id: number | string) => `/demat/banks/${id}`,
      DELETE: (id: number | string) => `/demat/banks/${id}`,
      UPLOAD_LOGO: (id: number | string) => `/demat/banks/${id}/logo`,
    },
    APPLICATIONS: {
      LIST: "/demat/applications",
      DETAIL: (id: number | string) => `/demat/applications/${id}`,
      CREATE: "/demat/applications",
      UPDATE_STATUS: (id: number | string) =>
        `/demat/applications/${id}/status`,
    },
  },

  CREDIT_CARDS: {
    APPLICATIONS: {
      LIST: "/credit-cards/applications",
      DETAIL: (id: number | string) => `/credit-cards/applications/${id}`,
      CREATE: "/credit-cards/applications",
      UPDATE_STATUS: (id: number | string) =>
        `/credit-cards/applications/${id}/status`,
    },
  },
  SAVINGS: {
    BANKS: {
      LIST: "/savings/banks",
      DETAIL: (id: number | string) => `/savings/banks/${id}`,
      CREATE: "/savings/banks",
      UPDATE: (id: number | string) => `/savings/banks/${id}`,
      DELETE: (id: number | string) => `/savings/banks/${id}`,
      UPLOAD_LOGO: (id: number | string) => `/savings/banks/${id}/logo`,
    },
    APPLICATIONS: {
      LIST: "/savings/applications",
      DETAIL: (id: number | string) => `/savings/applications/${id}`,
      CREATE: "/savings/applications",
      UPDATE_STATUS: (id: number | string) =>
        `/savings/applications/${id}/status`,
    },
  },

  // ---------- EMIs ----------
  EMIS: {
    BY_LOAN: (loanId: number | string) => `/emis/loan/${loanId}`,
    UPDATE_STATUS: (emiId: number | string) => `/emis/${emiId}/status`,
    UPCOMING: "/emis/upcoming",
    SEND_REMINDER: (emiId: number | string) => `/emis/${emiId}/send-reminder`,
  },

  AGENTS: {
    LIST: "/agents",
    CREATE: "/agents",
    DETAIL: (id: number | string) => `/agents/${id}`,
    GET_PERMISSIONS: (id: number | string) => `/agents/${id}/permissions`,
    TOGGLE_STATUS: (id: number | string) => `/agents/${id}/status`,
    UPDATE_PERMISSIONS: (id: number | string) => `/agents/${id}/permissions`,
  },

  AGENT_KYC: {
    ME: "/agent-kyc/me",
    DETAIL: (agentId: number | string) => `/agent-kyc/${agentId}`,
    UPDATE: (agentId: number | string) => `/agent-kyc/${agentId}`,
    REVIEW: (agentId: number | string) => `/agent-kyc/${agentId}/review`,
    LIST_DOCUMENTS: (agentId: number | string) =>
      `/agent-kyc/${agentId}/documents`,
    UPLOAD_DOCUMENT: (agentId: number | string) =>
      `/agent-kyc/${agentId}/documents`,
    DELETE_DOCUMENT: (agentId: number | string, documentId: number | string) =>
      `/agent-kyc/${agentId}/documents/${documentId}`,
  },

  // ---------- Banks ----------
  BANKS: {
    LIST: "/banks",
    CREATE: "/banks",
    DETAIL: (id: number | string) => `/banks/${id}`,
    UPDATE: (id: number | string) => `/banks/${id}`,
    DELETE: (id: number | string) => `/banks/${id}`,
    UPLOAD_LOGO: (id: number | string) => `/banks/${id}/logo`,
    REMOVE_LOGO: (id: number | string) => `/banks/${id}/logo`,
  },

  CREDIT_CARD_BANKS: {
    LIST: "/credit-card-banks",
    DETAIL: (id: number | string) => `/credit-card-banks/${id}`,
    CREATE: "/credit-card-banks",
    UPDATE: (id: number | string) => `/credit-card-banks/${id}`,
    DELETE: (id: number | string) => `/credit-card-banks/${id}`,
    UPLOAD_LOGO: (id: number | string) => `/credit-card-banks/${id}/logo`,
  },

  // ---------- Analytics ----------
  ANALYTICS: {
    AGENT_DASHBOARD: "/analytics/agent-dashboard",
    ADMIN_AGENTS_OVERVIEW: "/analytics/admin/agents-overview",
    ADMIN_AGENT_SUMMARY: (agentId: number | string) =>
      `/analytics/admin/agents/${agentId}/summary`,

    // Business-wide
    BUSINESS_KPIS: "/analytics/business/kpis",
    BUSINESS_FUNNEL: "/analytics/business/funnel",
    BUSINESS_COLLECTIONS_TREND: "/analytics/business/collections-trend",
    BUSINESS_CUSTOMER_TREND: "/analytics/business/customer-trend",
    BUSINESS_BANK_DISTRIBUTION: "/analytics/business/bank-distribution",
    BUSINESS_OVERDUE_AGING: "/analytics/business/overdue-aging",
    BUSINESS_RECENT_ACTIVITY: "/analytics/business/recent-activity",
    BUSINESS_TOP_CUSTOMERS: "/analytics/business/top-customers",
    BUSINESS_PRODUCT_MIX: "/analytics/business/product-mix",
    BUSINESS_DISBURSEMENT_TREND: "/analytics/business/disbursement-trend",
    BUSINESS_LOAN_TYPE_DIST: "/analytics/business/loan-type-dist",
    BUSINESS_CUSTOMERS_BY_CITY: "/analytics/business/customers-by-city",
    BUSINESS_COLLECTION_EFFICIENCY: "/analytics/business/collection-efficiency",
    BUSINESS_INTEREST_TYPE_SPLIT: "/analytics/business/interest-type-split",
    BUSINESS_AGENT_LEADERBOARD: "/analytics/business/agent-leaderboard",
    BUSINESS_KYC_FUNNEL: "/analytics/business/kyc-funnel",
  },
  MASTERS: {
    BUSINESS_TYPES: {
      LIST: "/masters/business-types",
      DETAIL: (id: number | string) => `/masters/business-types/${id}`,
      CREATE: "/masters/business-types",
      UPDATE: (id: number | string) => `/masters/business-types/${id}`,
      DELETE: (id: number | string) => `/masters/business-types/${id}`,
    },
    BUSINESS_CATEGORIES: {
      LIST: "/masters/business-categories",
      DETAIL: (id: number | string) => `/masters/business-categories/${id}`,
      CREATE: "/masters/business-categories",
      UPDATE: (id: number | string) => `/masters/business-categories/${id}`,
      DELETE: (id: number | string) => `/masters/business-categories/${id}`,
    },
  },

  // ---------- Reports ----------
  REPORTS: {
    FETCH: (reportType: string) => `/reports/${reportType}`,
  },

  // ---------- Audit Logs ----------
  AUDIT: {
    LIST: "/audits",
  },

  // ---------- Health ----------
  HEALTH: "/health",
} as const;
