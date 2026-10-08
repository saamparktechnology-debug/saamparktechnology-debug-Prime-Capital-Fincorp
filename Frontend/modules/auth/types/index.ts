// modules/auth/types/index.ts
import type { Role } from "@/lib/constants/statuses";

export interface LoginPayload {
  email: string;
  password: string;
  role: Role;
}

export interface AuthUser {
  id: number;
  role: Role;
  email: string;
  fullName: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface ForgotPasswordPayload {
  email: string;
  role: Role;
}

export interface ResetPasswordPayload {
  email: string;
  role: Role;
  code: string;
  new_password: string;
}
