// modules/profile/services/profileService.ts
import { api } from "@/lib/api/client";
import type { ChangePasswordPayload } from "../types";

export const profileService = {
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.post("/auth/change-password", payload);
  },
};
