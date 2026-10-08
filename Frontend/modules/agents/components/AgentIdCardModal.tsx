// modules/agents/components/AgentIdCardModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { AgentIdCard } from "./AgentIdCard";
import { downloadIdCardPdf, downloadIdCardPng } from "../utils/downloadIdCard";
import { useAgentKyc, useAgentDocuments } from "../hooks/useAgentKyc";
import { useCompany } from "../hooks/useCompany";
import { documentUrl } from "@/lib/format";

// CR80 portrait dimensions (must match AgentIdCard)
const CARD_WIDTH_PX = 638;
const CARD_HEIGHT_PX = 1011;

export function AgentIdCardModal({
  agentId,
  open,
  onOpenChange,
}: {
  agentId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const kycQ = useAgentKyc(open ? agentId : undefined);
  const docsQ = useAgentDocuments(open ? agentId : undefined);
  const companyQ = useCompany();

  const photoDoc = docsQ.data?.find(
    (d) => d.document_type.toLowerCase() === "photograph",
  );
  const photoUrl = photoDoc ? documentUrl(photoDoc.file_path) : null;

  const isLoading = kycQ.isLoading || companyQ.isLoading;

  const handleDownload = async (format: "pdf" | "png") => {
    if (!cardRef.current || !kycQ.data?.kyc) return;
    try {
      const filename = `${kycQ.data.kyc.agent_code || `agent-${agentId}`}-id-card`;
      if (format === "pdf") await downloadIdCardPdf(cardRef.current, filename);
      else await downloadIdCardPng(cardRef.current, filename);
    } catch (e) {
      console.error("ID card export failed", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex w-full flex-col gap-4 overflow-hidden p-6 sm:max-w-lg"
        style={{ maxHeight: "90vh" }}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>Agent ID Card</DialogTitle>
          <DialogDescription>
            Preview and download print-ready ID card (CR80 size).
          </DialogDescription>
        </DialogHeader>

        {/* Preview area */}
        <div
          style={{ backgroundColor: "#ffffff" }}
          className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg border"
        >
          {/* Off-screen, unscaled copy used only for export */}
          {kycQ.data?.kyc && companyQ.data && (
            <div
              aria-hidden
              style={{
                position: "fixed",
                left: -10000,
                top: 0,
                pointerEvents: "none",
              }}
            >
              <AgentIdCard
                ref={cardRef}
                kyc={kycQ.data.kyc}
                company={companyQ.data}
                photoUrl={photoUrl}
              />
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDownload("png")}
            disabled={isLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            PNG
          </Button>
          <Button onClick={() => handleDownload("pdf")} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Scales the CR80 card to fit whatever space the parent gives it.
 * Uses ResizeObserver so it adapts to modal size dynamically.
 */
function CardScaler({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const next = Math.min(width / CARD_WIDTH_PX, height / CARD_HEIGHT_PX);
      setScale(Math.max(0.2, Math.min(next, 1)));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ backgroundColor: "#ffffff" }}
      className="flex h-full w-full items-center justify-center p-2"
    >
      <div
        style={{
          width: CARD_WIDTH_PX * scale,
          height: CARD_HEIGHT_PX * scale,
          backgroundColor: "#ffffff",
        }}
        className="relative overflow-hidden rounded-lg shadow-sm"
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: CARD_WIDTH_PX,
            height: CARD_HEIGHT_PX,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
