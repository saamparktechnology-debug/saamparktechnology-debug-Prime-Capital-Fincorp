// modules/loans/components/LoanDocumentUploadCard.tsx
"use client";

import { useRef } from "react";
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { documentUrl } from "@/lib/format";
import type { DocumentChecklistItem } from "../services/loanDocumentService";

const MAX_SIZE_MB = 5;
const ACCEPTED = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

export function LoanDocumentUploadCard({
  item,
  index,
  onUpload,
  onRemove,
  uploading,
  removing,
  disabled,
}: {
  item: DocumentChecklistItem;
  index: number;
  onUpload: (file: File) => void;
  onRemove: () => void;
  uploading?: boolean;
  removing?: boolean;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      alert("Only PDF, JPG, JPEG, PNG allowed.");
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Max ${MAX_SIZE_MB}MB.`);
      return;
    }
    onUpload(f);
  };

  const url = documentUrl(item.path);

  return (
    <Card
      className={cn(
        "transition-colors",
        item.uploaded
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-amber-500/30 bg-amber-500/5",
      )}
    >
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              item.uploaded
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-amber-500/10 text-amber-600",
            )}
          >
            {item.uploaded ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium">
              {index + 1}. {item.label}
            </p>
            <div className="mt-1 flex items-center gap-2">
              {item.uploaded ? (
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                >
                  UPLOADED
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                >
                  PENDING
                </Badge>
              )}
              {item.path && (
                <span className="truncate text-xs text-muted-foreground">
                  {item.path.split("/").pop()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
          {item.uploaded && url && (
            <>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                title="View"
              >
                <Eye className="h-4 w-4" />
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={onRemove}
                disabled={disabled || removing}
                title="Remove"
              >
                {removing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <Button
            variant={item.uploaded ? "outline" : "default"}
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-3.5 w-3.5" />
                {item.uploaded ? "Replace" : "Upload"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
