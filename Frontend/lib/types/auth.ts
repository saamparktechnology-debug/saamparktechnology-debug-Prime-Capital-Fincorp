// lib/types/auth.ts
import type { Role } from "@/lib/constants/statuses";
import type { AgentPermission } from "@/lib/constants/permissions";

export interface LoginPayload {
  email: string;
  password: string;
  role: Role;
}

export interface LoginResponse {
  email: string;
  channel: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  role: Role;
}

export interface AuthUser {
  id: number;
  role: Role;
  email: string;
  fullName: string;
}

export interface VerifyOtpResponse {
  access_token: string;
  user: AuthUser;
}

/** Stored in Zustand after successful login */
export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  permissions: AgentPermission[] | null;
}
