// modules/masters/types/index.ts

export interface BusinessType {
  type_id: number;
  type_name: string;
  description: string | null;
  is_active: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessCategory {
  category_id: number;
  category_name: string;
  description: string | null;
  is_active: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBusinessTypePayload {
  type_name: string;
  description?: string;
  is_active?: number;
  display_order?: number;
}

export interface CreateBusinessCategoryPayload {
  category_name: string;
  description?: string;
  is_active?: number;
  display_order?: number;
}
