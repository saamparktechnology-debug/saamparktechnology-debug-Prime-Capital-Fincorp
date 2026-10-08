// lib/constants/permissions.ts
import { ROLE, type Role } from "./statuses";

export const MODULES = {
  CUSTOMERS: "customers",
  KYC: "kyc",
  LOANS: "loans",
  REPORTS: "reports",
} as const;

export type Module = (typeof MODULES)[keyof typeof MODULES];

export const ACTIONS = {
  CREATE: "can_create",
  READ: "can_read",
  UPDATE: "can_update",
  DELETE: "can_delete",
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

export interface AgentPermission {
  module_name: Module;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export type PermissionMap = Partial<
  Record<Module, Partial<Record<Action, boolean>>>
>;

/**
 * Helper: does this user have permission?
 * Admins bypass all module checks.
 */
export const hasPermission = (
  role: Role | undefined,
  permissions: PermissionMap | null | undefined,
  module: Module,
  action: Action,
): boolean => {
  if (!role) return false;
  if (role === ROLE.ADMIN) return true;
  if (role === ROLE.AGENT) {
    return Boolean(permissions?.[module]?.[action]);
  }
  return false;
};
