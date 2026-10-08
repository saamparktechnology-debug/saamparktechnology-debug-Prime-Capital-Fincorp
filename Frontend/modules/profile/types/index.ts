// modules/profile/types/index.ts

export interface ProfileInfo {
  id: number;
  email: string;
  fullName: string;
  role: "admin" | "agent";
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface Preferences {
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  smsNotifications: boolean;
  language: "en" | "hi" | "bn";
}
