// lib/utils/validators.ts

export const AADHAAR_REGEX = /^\d{4}\s?\d{4}\s?\d{4}$/;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export const AADHAAR_ERROR =
  "Enter a valid 12-digit Aadhaar number (e.g., 1234 5678 9012)";
export const PAN_ERROR = "Enter a valid PAN (e.g., ABCDE1234F)";
