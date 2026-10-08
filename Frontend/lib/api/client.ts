// lib/api/client.ts
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/lib/config/env";

// ---------- Types ----------
export interface ApiSuccess<T> {
  status: "success";
  message?: string;
  count?: number;
  data: T;
}

export interface ApiFail {
  status: "fail" | "error";
  message: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFail;

// ---------- Axios Instance ----------
export const api: AxiosInstance = axios.create({
  baseURL: env.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30s
});

// ---------- Token Accessors (avoid circular import) ----------
type TokenGetter = () => string | null;
type LogoutHandler = () => void;

let getToken: TokenGetter = () => null;
let onUnauthorized: LogoutHandler = () => {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

export const registerAuthHandlers = (opts: {
  getToken: TokenGetter;
  onUnauthorized: LogoutHandler;
}) => {
  getToken = opts.getToken;
  onUnauthorized = opts.onUnauthorized;
  console.log("[API] auth handlers registered");
};

// ---------- Request Interceptor ----------
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    console.log("[API →]", config.method?.toUpperCase(), config.url, {
      baseURL: config.baseURL,
      hasToken: Boolean(token),
    });
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => {
    console.log("[API ✖ request error]", error);
    return Promise.reject(error);
  },
);

// ---------- Response Interceptor ----------
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("[API ←]", response.status, response.config.url);
    return response;
  },
  (error: AxiosError<ApiFail>) => {
    const status = error.response?.status;
    const url = error.config?.url;

    console.log("[API ← error]", status, url, error.message);
    console.log("[API ← error data]", error.response?.data);
    console.log("[API ← error code]", error.code);

    if (status === 401) {
      onUnauthorized();
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    return Promise.reject(Object.assign(error, { normalizedMessage: message }));
  },
);

// ---------- Helper: Unwrap response ----------
export const unwrap = <T>(res: AxiosResponse<ApiSuccess<T>>): T => {
  return res.data.data;
};

// ---------- Helper: Extract error message ----------
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      (error as AxiosError<ApiFail>).response?.data?.message ||
      error.message ||
      "Request failed."
    );
  }
  if (error instanceof Error) return error.message;
  return "Unknown error occurred.";
};
