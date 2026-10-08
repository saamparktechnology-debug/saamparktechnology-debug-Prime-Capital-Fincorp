// lib/types/agent.ts
import type { AgentPermission } from "@/lib/constants/permissions";

export interface Agent {
  agent_id: number;
  email: string;
  full_name: string;
  phone_number: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAgentPayload {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
}

export interface ToggleAgentStatusPayload {
  is_active: boolean;
}

export interface UpdateAgentPermissionsPayload {
  permissions: AgentPermission[];
}
