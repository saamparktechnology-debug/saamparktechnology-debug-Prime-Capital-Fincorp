// components/ui/upload-input.tsx
"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadInputProps {
  accept?: string;
  maxSizeMB?: number;
  onFileSelect: (file: File | null) => void;
  currentPreview?: string | null;
  label?: string;
  loading?: boolean;
  variant?: "image" | "document";
}

export function UploadInput({
  accept = "image/jpeg,image/jpg,image/png,image/webp,image/svg+xml",
  maxSizeMB = 2,
  onFileSelect,
  currentPreview,
  label = "Upload",
  loading = false,
  variant = "image",
}: UploadInputProps) {
  const [preview, setPreview] = useState<string | null>(currentPreview ?? null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    setError(null);
    if (!f) {
      setPreview(null);
      setFileName(null);
      onFileSelect(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const allowed = accept.split(",").map((s) => s.trim());
    if (allowed.length > 0 && !allowed.includes(f.type)) {
      setError(`Unsupported file type. Allowed: ${accept}`);
      return;
    }

    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`Max file size is ${maxSizeMB}MB.`);
      return;
    }

    setFileName(f.name);
    if (variant === "image") {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
    onFileSelect(f);
  };

  const clear = () => {
    setPreview(null);
    setFileName(null);
    setError(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted",
            variant === "image" ? "h-20 w-20" : "h-14 w-14",
          )}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-contain p-1"
            />
          ) : variant === "image" ? (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          ) : (
            <FileText className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <Upload className="mr-2 h-3 w-3" />
            )}
            {preview || fileName ? "Change" : label}
          </Button>

          {(preview || fileName) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={clear}
              disabled={loading}
            >
              <X className="mr-2 h-3 w-3" />
              Remove
            </Button>
          )}

          {fileName && variant === "document" && (
            <p className="max-w-[200px] truncate text-xs text-muted-foreground">
              {fileName}
            </p>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
