// lib/hooks/usePermission.ts
"use client";

import { useAuthStore } from "@/store/authStore";
import {
  hasPermission,
  type Action,
  type Module,
  type PermissionMap,
} from "@/lib/constants/permissions";
import { ROLE } from "@/lib/constants/statuses";

export const usePermission = () => {
  const { user, permissions } = useAuthStore();

  const permissionMap: PermissionMap = {};
  if (Array.isArray(permissions)) {
    for (const p of permissions) {
      permissionMap[p.module_name] = {
        can_create: p.can_create,
        can_read: p.can_read,
        can_update: p.can_update,
        can_delete: p.can_delete,
      };
    }
  }

  return {
    role: user?.role,
    isAdmin: user?.role === ROLE.ADMIN,
    isAgent: user?.role === ROLE.AGENT,
    can: (module: Module, action: Action) =>
      hasPermission(user?.role, permissionMap, module, action),
  };
};
