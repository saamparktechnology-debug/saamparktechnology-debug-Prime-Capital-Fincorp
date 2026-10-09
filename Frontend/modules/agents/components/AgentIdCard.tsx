// modules/agents/components/AgentIdCard.tsx
"use client";

import { forwardRef } from "react";

import { documentUrl } from "@/lib/format";
import type { AgentKyc, CompanyProfile } from "../types/agentKyc";

// CR80 portrait: 54mm × 85.6mm @ 300 DPI
const CARD_WIDTH_PX = 638;
const CARD_HEIGHT_PX = 1011;
const NAVY = "#0b2a5b";

/** Very faint flowing lines on both sides of the photo */
function WaveLines({ side }: { side: "left" | "right" }) {
  const count = 26;
  const w = 190;
  const h = 360;
  const lines = Array.from({ length: count }, (_, i) => {
    const y = (i / (count - 1)) * h;
    const tipX = side === "left" ? w : 0;
    const startX = side === "left" ? 0 : w;
    const cx = side === "left" ? w * 0.4 : w * 0.6;
    return `M${startX},${y} Q${cx},${h / 2 + (y - h / 2) * 0.2} ${tipX},${h / 2}`;
  });
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        position: "absolute",
        top: 0,
        [side]: 0,
        pointerEvents: "none",
      }}
    >
      {lines.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#b9cdf0"
          strokeWidth="0.7"
          opacity="0.5"
        />
      ))}
    </svg>
  );
}

/** Solid white map pin with a navy dot */
function PinIcon() {
  return (
    <svg width="52" height="64" viewBox="0 0 52 64" style={{ flexShrink: 0 }}>
      <path
        d="M26 0C11.6 0 0 11.4 0 25.5 0 44 26 64 26 64s26-20 26-38.5C52 11.4 40.4 0 26 0z"
        fill="#ffffff"
      />
      <circle cx="26" cy="25" r="10" fill={NAVY} />
    </svg>
  );
}

/** Fallback: PCF205 + "00" + agent_id, matches backend format */
const buildAgentCode = (kyc: AgentKyc) =>
  kyc.agent_code || (kyc.agent_id ? `PCF20500${kyc.agent_id}` : "—");

/** Company address pulled from company_profile */
const buildCompanyAddress = (company: CompanyProfile) =>
  [
    company.address_line1,
    company.address_line2,
    company.city,
    company.state,
    company.pincode,
  ]
    .filter(Boolean)
    .join(", ");

export const AgentIdCard = forwardRef<
  HTMLDivElement,
  {
    kyc: AgentKyc;
    company: CompanyProfile;
    photoUrl?: string | null;
  }
>(function AgentIdCard({ kyc, company, photoUrl }, ref) {
  const initials = (kyc.full_name || "Agent")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const logoUrl = documentUrl(company.logo_path);

  // First two words big (CAPITAL FINCORP), the rest smaller below
  const words = (company.company_name || "").trim().split(/\s+/);
  const line1 = words.slice(0, 3).join(" ");
  const line2 = words.slice(2).join(" ");

  const fmt = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString("en-GB").replace(/\//g, "-") : "—";

  const agentCode = buildAgentCode(kyc);
  const companyAddress = buildCompanyAddress(company);

  return (
    <div
      ref={ref}
      style={{
        width: CARD_WIDTH_PX,
        height: CARD_HEIGHT_PX,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        color: NAVY,
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: NAVY,
          color: "#fff",
          borderRadius: "18px 18px 0 0",
          padding: "0 30px",
          display: "flex",
          alignItems: "center",
          gap: 22,
          height: 152,
          flexShrink: 0,
        }}
      >
        {/* Logo: sits directly on the navy header */}
        <div
          style={{
            width: 134,
            height: 104,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            borderRadius: 10,
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              crossOrigin="anonymous"
              style={{ width: "130%", height: "130%", objectFit: "contain" }}
            />
          ) : (
            <span style={{ fontSize: 44, fontWeight: 800, color: "#fff" }}>
              {initials}
            </span>
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              textTransform: "uppercase",
              lineHeight: 1.05,
              letterSpacing: 1,
              whiteSpace: "nowrap",
            }}
          >
            {line1}
          </div>
          {line2 && (
            <div
              style={{
                marginTop: 8,
                fontSize: 26,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 3.5,
                whiteSpace: "nowrap",
              }}
            >
              {line2}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 18,
          minHeight: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 0,
            right: 0,
            height: 360,
          }}
        >
          <WaveLines side="left" />
          <WaveLines side="right" />
        </div>

        {/* Photo */}
        <div
          style={{
            position: "relative",
            width: 312,
            height: 392,
            border: `3px solid ${NAVY}`,
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
            flexShrink: 0,
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Photo"
              crossOrigin="anonymous"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 64, fontWeight: 800 }}>{initials}</span>
          )}
        </div>

        {/* Name */}
        <div
          style={{
            position: "relative",
            marginTop: 14,
            fontSize: 54,
            fontWeight: 800,
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: 2.5,
            lineHeight: 1.1,
            whiteSpace: "nowrap",
          }}
        >
          {kyc.full_name || "Agent Name"}
        </div>

        {/* Employee code pill */}
        <div
          style={{
            position: "relative",
            marginTop: 10,
            padding: "9px 30px",
            backgroundColor: NAVY,
            color: "#fff",
            borderRadius: 12,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          Employee Code: {agentCode}
        </div>

        {/* Role */}
        <div
          style={{
            position: "relative",
            marginTop: 8,
            fontSize: 22,
            fontWeight: 500,
          }}
        >
          Sales Officer
        </div>

        {/* Divider */}
        <div
          style={{
            position: "relative",
            marginTop: 10,
            height: 2,
            width: "86%",
            backgroundColor: NAVY,
          }}
        />

        {/* Dates */}
        <div
          style={{
            position: "relative",
            marginTop: 10,
            width: "86%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            textAlign: "center",
          }}
        >
          <div style={{ borderRight: `2px solid ${NAVY}` }}>
            <div style={{ fontSize: 24, fontWeight: 500 }}>Issue Date:</div>
            <div
              style={{
                marginTop: 2,
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: 1.5,
              }}
            >
              {fmt(kyc.issue_date)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 500 }}>Valid Date:</div>
            <div
              style={{
                marginTop: 2,
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: 1.5,
              }}
            >
              {fmt(kyc.valid_till)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer — company address (not agent address) */}
      <div
        style={{
          backgroundColor: NAVY,
          color: "#fff",
          borderRadius: "0 0 18px 18px",
          padding: "0 30px",
          display: "flex",
          alignItems: "center",
          gap: 34,
          height: 122,
          flexShrink: 0,
        }}
      >
        <div style={{ width: 52, display: "flex", justifyContent: "center" }}>
          <PinIcon />
        </div>
        <div
          style={{
            flex: 1,
            fontSize: 24,
            fontWeight: 700,
            textTransform: "uppercase",
            lineHeight: 1.3,
            letterSpacing: 1,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {companyAddress || "Address not provided"}
        </div>
      </div>
    </div>
  );
});
