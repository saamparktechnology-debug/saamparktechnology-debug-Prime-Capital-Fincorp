// lib/types/api.ts

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

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFail;
