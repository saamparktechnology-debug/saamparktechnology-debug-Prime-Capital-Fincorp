// store/authStore.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser, AuthState } from "@/lib/types/auth";
import type { AgentPermission } from "@/lib/constants/permissions";
import { registerAuthHandlers } from "@/lib/api/client";

interface AuthStore extends AuthState {
  setSession: (data: {
    token: string;
    user: AuthUser;
    permissions?: AgentPermission[] | null;
  }) => void;
  setPermissions: (permissions: AgentPermission[]) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      permissions: null,

      setSession: ({ token, user, permissions = null }) =>
        set({ token, user, permissions }),

      setPermissions: (permissions) => set({ permissions }),

      logout: () =>
        set({
          token: null,
          user: null,
          permissions: null,
        }),

      isAuthenticated: () => Boolean(get().token && get().user),
    }),
    {
      name: "bsa-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        permissions: state.permissions,
      }),
    },
  ),
);

// ---------- Register token getter + logout handler with Axios ----------
// This breaks the circular dependency between store and API client.
registerAuthHandlers({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => {
    useAuthStore.getState().logout();
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/verify-otp") {
        window.location.href = "/login";
      }
    }
  },
});
