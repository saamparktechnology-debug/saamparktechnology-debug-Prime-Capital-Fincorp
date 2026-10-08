// modules/agents/types/index.ts
export type {
  Agent,
  CreateAgentPayload,
  ToggleAgentStatusPayload,
  UpdateAgentPermissionsPayload,
} from "@/lib/types/agent";

export type {
  AgentPermission,
  Module,
  Action,
} from "@/lib/constants/permissions";

export type {
  AgentKyc,
  AgentKycWithAgent,
  AgentDocument,
  UpdateAgentKycPayload,
  ReviewAgentKycPayload,
  KycStatus,
} from "./agentKyc";
