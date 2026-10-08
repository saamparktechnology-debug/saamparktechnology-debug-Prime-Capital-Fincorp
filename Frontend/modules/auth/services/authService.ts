// modules/auth/services/authService.ts
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  LoginPayload,
  LoginResponse,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "../types";

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await api.post(ENDPOINTS.AUTH.LOGIN, payload);
    return unwrap<LoginResponse>(res);
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, payload);
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await api.post(ENDPOINTS.AUTH.RESET_PASSWORD, payload);
  },
};
