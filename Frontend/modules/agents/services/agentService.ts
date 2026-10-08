// modules/agents/services/agentService.ts
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  Agent,
  CreateAgentPayload,
  UpdateAgentPermissionsPayload,
} from "../types";
import type { AgentPermission } from "@/lib/constants/permissions";

export const agentService = {
  async list(): Promise<Agent[]> {
    const res = await api.get(ENDPOINTS.AGENTS.LIST);
    return unwrap<Agent[]>(res);
  },

  async detail(id: number | string): Promise<Agent> {
    const res = await api.get(ENDPOINTS.AGENTS.DETAIL(id));
    return unwrap<Agent>(res);
  },

  async getPermissions(id: number | string): Promise<AgentPermission[]> {
    const res = await api.get(ENDPOINTS.AGENTS.GET_PERMISSIONS(id));
    return unwrap<AgentPermission[]>(res);
  },

  async create(payload: CreateAgentPayload): Promise<Agent> {
    const res = await api.post(ENDPOINTS.AGENTS.CREATE, payload);
    return unwrap<Agent>(res);
  },

  async toggleStatus(id: number, is_active: boolean): Promise<void> {
    await api.patch(ENDPOINTS.AGENTS.TOGGLE_STATUS(id), { is_active });
  },

  async updatePermissions(
    id: number,
    payload: UpdateAgentPermissionsPayload,
  ): Promise<void> {
    await api.put(ENDPOINTS.AGENTS.UPDATE_PERMISSIONS(id), payload);
  },
};
