// modules/agents/components/AgentIdCard.tsx
"use client";

import { forwardRef } from "react";
import { documentUrl } from "@/lib/format";
import type { AgentKyc, CompanyProfile } from "../types/agentKyc";

const CARD_WIDTH_PX = 638;
const CARD_HEIGHT_PX = 1011;

const NAVY = "#0b2e59";
const TEXT_DARK = "#0f172a";
const TEXT_MUTED = "#64748b";
const SLATE_LIGHT = "#cbd5e1";
const SLATE_BG = "#f1f5f9";

export const AgentIdCard = forwardRef<
  HTMLDivElement,
  {
    kyc: AgentKyc;
    company: CompanyProfile;
    photoUrl?: string | null;
  }
>(function AgentIdCard({ kyc, company, photoUrl }, ref) {
  // Address now comes from COMPANY PROFILE, not agent
  const companyAddress = [
    company.address_line1,
    company.address_line2,
    company.city,
    company.state,
    company.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const initials = (kyc.full_name || "Agent")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const logoUrl = documentUrl(company.logo_path);

  // Agent code line — e.g. "PCF205001"
  const agentCode = kyc.agent_code || "PCF205—";

  return (
    <div
      ref={ref}
      style={{
        width: CARD_WIDTH_PX,
        height: CARD_HEIGHT_PX,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        color: TEXT_DARK,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ---------- Header ---------- */}
      <div
        style={{
          backgroundColor: NAVY,
          padding: "20px 24px",
          color: "#ffffff",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              crossOrigin="anonymous"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                objectFit: "contain",
                padding: 4,
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                color: NAVY,
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
              {initials}
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {company.company_name}
            </p>
            {company.tagline && (
              <p
                style={{
                  margin: "2px 0 0 0",
                  fontSize: 10,
                  textTransform: "uppercase",
                  opacity: 0.9,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {company.tagline}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Body ---------- */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 24px",
          flex: 1,
        }}
      >
        {/* Photo */}
        <div
          style={{
            width: 160,
            height: 192,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderRadius: 12,
            border: `4px solid ${NAVY}`,
            backgroundColor: SLATE_BG,
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Photo"
              crossOrigin="anonymous"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <span
              style={{
                fontSize: 36,
                fontWeight: "bold",
                color: NAVY,
              }}
            >
              {initials}
            </span>
          )}
        </div>

        {/* Name */}
        <p
          style={{
            margin: "16px 0 0 0",
            fontSize: 22,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: 1,
            color: NAVY,
            textAlign: "center",
          }}
        >
          {kyc.full_name || "Agent Name"}
        </p>

        {/* Agent code badge — "AGENT CODE: PCF205001" */}
        <div
          style={{
            marginTop: 8,
            padding: "6px 16px",
            borderRadius: 6,
            backgroundColor: NAVY,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: "bold",
              letterSpacing: 1,
              color: "#ffffff",
            }}
          >
            AGENT CODE: {agentCode}
          </p>
        </div>

        {/* Role */}
        <p
          style={{
            margin: "8px 0 0 0",
            fontSize: 13,
            fontWeight: 500,
            color: "#334155",
          }}
        >
          Field Officer
        </p>

        {/* Divider */}
        <div
          style={{
            marginTop: 16,
            height: 1,
            width: "100%",
            backgroundColor: SLATE_LIGHT,
          }}
        />

        {/* Dates */}
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            width: "100%",
            textAlign: "center",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: TEXT_MUTED,
              }}
            >
              Issue Date:
            </p>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: 15,
                fontWeight: "bold",
                color: NAVY,
              }}
            >
              {kyc.issue_date
                ? new Date(kyc.issue_date).toLocaleDateString("en-GB")
                : "—"}
            </p>
          </div>
          <div
            style={{
              borderLeft: `1px solid ${SLATE_LIGHT}`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: TEXT_MUTED,
              }}
            >
              Valid Till:
            </p>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: 15,
                fontWeight: "bold",
                color: NAVY,
              }}
            >
              {kyc.valid_till
                ? new Date(kyc.valid_till).toLocaleDateString("en-GB")
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Footer ---------- */}
      <div
        style={{
          backgroundColor: NAVY,
          padding: "16px 24px",
          color: "#ffffff",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0, marginTop: 2 }}
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 500,
            textTransform: "uppercase",
            lineHeight: 1.5,
          }}
        >
          {companyAddress || "Address not provided"}
        </p>
      </div>
    </div>
  );
});
