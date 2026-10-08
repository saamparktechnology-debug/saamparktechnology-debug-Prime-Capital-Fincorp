// modules/agents/components/AgentIdCard.tsx
"use client";

import { forwardRef } from "react";
import { MapPin } from "lucide-react";

import { documentUrl } from "@/lib/format";
import type { AgentKyc, CompanyProfile } from "../types/agentKyc";

// CR80 portrait: 54mm × 85.6mm @ 300 DPI
const CARD_WIDTH_PX = 638;
const CARD_HEIGHT_PX = 1011;
const NAVY = "#0b2a5b";

/** Faint flowing lines behind the photo, like the reference design */
function WaveLines({ side }: { side: "left" | "right" }) {
  const count = 22;
  const lines = Array.from({ length: count }, (_, i) => {
    const y = (i / (count - 1)) * 300;
    const tipX = side === "left" ? 150 : 0;
    const startX = side === "left" ? 0 : 150;
    const cx = side === "left" ? 60 : 90;
    return `M${startX},${y} Q${cx},${150 + (y - 150) * 0.15} ${tipX},150`;
  });
  return (
    <svg
      width="150"
      height="300"
      viewBox="0 0 150 300"
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
          stroke="#9db8e8"
          strokeWidth="0.8"
          opacity="0.55"
        />
      ))}
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

  // Split company name: first two words big, the rest smaller below
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
        padding: "0 32px 28px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: NAVY,
          color: "#fff",
          marginTop: 72,
          borderRadius: "28px 28px 0 0",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          height: 150,
        }}
      >
        {/* Logo tile: light background so dark logos stay visible */}
        <div
          style={{
            width: 104,
            height: 104,
            flexShrink: 0,
            backgroundColor: "#eef3fb",
            borderRadius: 22,
            padding: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              crossOrigin="anonymous"
              style={{ width: "120%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <span style={{ fontSize: 34, fontWeight: 800, color: NAVY }}>
              {initials}
            </span>
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: line1.length > 12 ? 28 : 38,
              fontWeight: 800,
              textTransform: "uppercase",
              lineHeight: 1.05,
              letterSpacing: 0.5,
              whiteSpace: "nowrap",
            }}
          >
            {line1}
          </div>
          {line2 && (
            <div
              style={{
                marginTop: 6,
                fontSize: 19,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 3,
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
          paddingTop: 22,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 0,
            right: 0,
            height: 300,
          }}
        >
          <WaveLines side="left" />
          <WaveLines side="right" />
        </div>

        {/* Photo */}
        <div
          style={{
            position: "relative",
            width: 350,
            height: 328,
            border: `4px solid ${NAVY}`,
            borderRadius: 22,
            overflow: "hidden",
            backgroundColor: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
            marginTop: 22,
            fontSize: 40,
            fontWeight: 800,
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: 1,
            lineHeight: 1.1,
          }}
        >
          {kyc.full_name || "Agent Name"}
        </div>

        {/* Employee code pill — code + FINCORP on the same line */}
        <div
          style={{
            marginTop: 14,
            width: "92%",
            backgroundColor: NAVY,
            color: "#fff",
            borderRadius: 12,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>{agentCode}</span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: 3,
              opacity: 0.9,
            }}
          >
            FINCORP
          </span>
        </div>

        {/* Role */}
        <div style={{ marginTop: 10, fontSize: 21, fontWeight: 500 }}>
          Sales Officer
        </div>

        {/* Divider */}
        <div
          style={{
            marginTop: 14,
            height: 2,
            width: "92%",
            backgroundColor: NAVY,
          }}
        />

        {/* Dates */}
        <div
          style={{
            marginTop: 12,
            width: "92%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            textAlign: "center",
          }}
        >
          <div style={{ borderRight: "1px solid #94a3b8" }}>
            <div style={{ fontSize: 20, fontWeight: 500 }}>Issue Date:</div>
            <div
              style={{
                marginTop: 4,
                fontSize: 31,
                fontWeight: 800,
                letterSpacing: 1,
              }}
            >
              {fmt(kyc.issue_date)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 500 }}>Valid Date:</div>
            <div
              style={{
                marginTop: 4,
                fontSize: 31,
                fontWeight: 800,
                letterSpacing: 1,
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
          borderRadius: "0 0 28px 28px",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          gap: 22,
          height: 128,
        }}
      >
        <MapPin style={{ width: 44, height: 44, flexShrink: 0 }} />
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            textTransform: "uppercase",
            lineHeight: 1.35,
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
