// modules/profile/hooks/useChangePassword.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { profileService } from "../services/profileService";
import { getErrorMessage } from "@/lib/api/client";
import type { ChangePasswordPayload } from "../types";

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      profileService.changePassword(payload),
    onSuccess: () => {
      toast.success("Password updated successfully.");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
