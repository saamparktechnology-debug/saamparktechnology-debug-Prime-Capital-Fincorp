// lib/types/audit.ts

export interface AuditLog {
  audit_id: number;
  actor_type: "admin" | "agent" | "system";
  actor_id: number;
  actor_name?: string | null; // ← NEW
  actor_email?: string | null; // ← NEW
  action: string;
  target_entity: string;
  target_id: number;
  old_value?: string | null;
  new_value?: string | null;
  ip_address?: string | null;
  created_at: string;
}
