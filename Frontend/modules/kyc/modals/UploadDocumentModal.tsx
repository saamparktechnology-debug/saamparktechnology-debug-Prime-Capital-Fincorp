// modules/kyc/modals/UploadDocumentModal.tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { UploadInput } from "@/components/ui/upload-input";

import { useUploadDocument } from "../hooks/useKyc";
import { type SelectOption, optionTag } from "@/lib/format";

const DOCUMENT_TYPES = [
  "Aadhaar Card",
  "PAN Card",
  "Voter ID",
  "Driving License",
  "Passport",
  "Bank Passbook",
  "Salary Slip",
  "Photograph",
  "Address Proof",
  "Other",
];

const DOC_TYPE_OPTIONS: SelectOption[] = DOCUMENT_TYPES.map((t) => ({
  value: t,
  tag: t,
}));

export function UploadDocumentModal({
  customerId,
  open,
  onOpenChange,
  onSuccess,
}: {
  customerId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadM = useUploadDocument(customerId);

  const reset = () => {
    setDocType("");
    setFile(null);
    setError(null);
  };

  const handleSubmit = () => {
    setError(null);
    if (!docType) {
      setError("Please select a document type.");
      return;
    }
    if (!file) {
      setError("Please choose a file.");
      return;
    }

    uploadM.mutate(
      { document_type: docType, file },
      {
        onSuccess: () => {
          onSuccess?.();
          reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload KYC Document</DialogTitle>
          <DialogDescription>
            PDF, JPG, JPEG, or PNG. Max 5MB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Document Type <span className="text-destructive">*</span>
            </Label>
            <Select value={docType} onValueChange={(v) => setDocType(v ?? "")}>
              <SelectTrigger>
                <span className={!docType ? "text-muted-foreground" : ""}>
                  {optionTag(DOC_TYPE_OPTIONS, docType) ??
                    "Select document type"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {DOC_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              File <span className="text-destructive">*</span>
            </Label>
            <UploadInput
              variant="document"
              maxSizeMB={5}
              onFileSelect={setFile}
              label="Choose file"
              loading={uploadM.isPending}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploadM.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={uploadM.isPending}>
            {uploadM.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
