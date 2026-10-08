// lib/config/env.ts

/**
 * Centralized, typed access to environment variables.
 * Fails fast at build/runtime if a required variable is missing.
 */

const requireEnv = (key: string, value: string | undefined): string => {
  if (!value || value.trim() === "") {
    throw new Error(
      `[env] Missing required environment variable: ${key}. ` +
        `Please check your .env.local file.`,
    );
  }
  return value;
};

export const env = {
  API_URL: requireEnv("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL),
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "Prime Capital Fincorp",
  IS_DEV: process.env.NODE_ENV === "development",
  IS_PROD: process.env.NODE_ENV === "production",
} as const;
