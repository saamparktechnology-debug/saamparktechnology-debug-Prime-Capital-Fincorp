"use client";

import { useEffect, useState } from "react";
import { MessageCircle, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Indian mobile: 10 digits starting 6-9 */
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

/** Strip everything except digits */
const digitsOnly = (s: string) => s.replace(/\D/g, "");

/** Normalize to 10-digit Indian number from a variety of inputs */
const normalizeTo10 = (raw: string): string => {
  let d = digitsOnly(raw);
  // Drop leading 91 or 0 if present (e.g. +91 98..., 098...)
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
};

export interface WhatsAppShareProps {
  /** Prefilled phone (any format) — will be normalized to 10 digits */
  defaultPhone?: string | null;
  /** Message body — the share link is appended after the message */
  message: string;
  /** Optional className on the wrapper */
  className?: string;
  /** Optional small helper text shown below the input */
  helperText?: string;
}

export function WhatsAppShare({
  defaultPhone,
  message,
  className,
  helperText,
}: WhatsAppShareProps) {
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setPhone(normalizeTo10(defaultPhone ?? ""));
  }, [defaultPhone]);

  const normalized = normalizeTo10(phone);
  const isValid = INDIAN_MOBILE_REGEX.test(normalized);
  const showError = touched && phone.length > 0 && !isValid;

  const handleShare = () => {
    if (!isValid) {
      setTouched(true);
      return;
    }

    const waNumber = `91${normalized}`;
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className={cn("border-emerald-500/30 bg-emerald-500/5", className)}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Share on WhatsApp
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="wa-phone" className="text-xs">
            Mobile Number <span className="text-destructive">*</span>
          </Label>

          <div className="flex items-stretch">
            <span className="flex select-none items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
              +91
            </span>
            <Input
              id="wa-phone"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="9876543210"
              maxLength={10}
              value={phone}
              onChange={(e) => {
                setPhone(digitsOnly(e.target.value).slice(0, 10));
                setTouched(true);
              }}
              onBlur={() => setTouched(true)}
              className={cn(
                "rounded-l-none",
                showError &&
                  "border-destructive focus-visible:ring-destructive/30",
              )}
              aria-invalid={showError}
              aria-describedby={
                showError
                  ? "wa-phone-error"
                  : helperText
                    ? "wa-phone-hint"
                    : undefined
              }
            />
          </div>

          {showError ? (
            <p
              id="wa-phone-error"
              role="alert"
              className="flex items-center gap-1 text-xs text-destructive"
            >
              <AlertTriangle className="h-3 w-3" />
              Enter a valid 10-digit Indian mobile number.
            </p>
          ) : helperText ? (
            <p id="wa-phone-hint" className="text-xs text-muted-foreground">
              {helperText}
            </p>
          ) : null}
        </div>

        <Button
          type="button"
          onClick={handleShare}
          disabled={!isValid}
          className="w-full bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Share on WhatsApp
        </Button>
      </CardContent>
    </Card>
  );
}
