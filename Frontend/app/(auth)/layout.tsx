// app/(auth)/layout.tsx
import type { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background lg:grid lg:grid-cols-2">
      {/* LEFT — form column */}
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* RIGHT — decorative panel (hidden on mobile) */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 lg:flex lg:items-center lg:justify-center">
        <AuthIllustration />
      </div>
    </div>
  );
}

function AuthIllustration() {
  return (
    <div className="relative z-10 flex max-w-lg flex-col items-center gap-8 px-10 text-center text-white">
      {/* Abstract background shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/3 right-10 h-24 w-24 rounded-full bg-white/5" />
      </div>

      {/* Real Logo — big, centered on white pill */}
      <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-white p-4 shadow-2xl">
        <Image
          src="/logo.png"
          alt="Prime Capital Fincorp"
          width={96}
          height={96}
          className="h-full w-full object-contain"
          priority
        />
      </div>

      {/* Text */}
      <div className="relative space-y-3">
        <h2 className="text-3xl font-bold tracking-tight">
          Empowering Financial Inclusion
        </h2>
        <p className="text-sm text-white/80">
          Manage customers, loans, EMIs, and partner banks — all in one place.
        </p>
      </div>

      {/* Feature badges */}
      <div className="relative flex flex-wrap items-center justify-center gap-2">
        {[
          "Customer Onboarding",
          "Loan Lifecycle",
          "EMI Tracking",
          "Partner Banks",
        ].map((label) => (
          <span
            key={label}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
