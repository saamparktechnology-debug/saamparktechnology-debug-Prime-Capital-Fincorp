// modules/agents/components/AgentDocumentsList.tsx
"use client";

import { FileText, Upload, Trash2, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, documentUrl } from "@/lib/format";
import type { AgentDocument } from "../types";

export function AgentDocumentsList({
  documents,
  loading,
  onUpload,
  onDelete,
  canManage,
}: {
  documents: AgentDocument[] | undefined;
  loading?: boolean;
  onUpload?: () => void;
  onDelete?: (doc: AgentDocument) => void;
  canManage: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Documents</CardTitle>
        {canManage && onUpload && (
          <Button size="sm" onClick={onUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : !documents || documents.length === 0 ? (
          <EmptyState
            title="No documents uploaded"
            description={
              canManage
                ? "Upload KYC documents to begin verification."
                : "Admin will upload KYC documents on your behalf."
            }
            icon={<FileText className="h-6 w-6" />}
          />
        ) : (
          <ul className="divide-y">
            {documents.map((doc) => {
              const url = documentUrl(doc.file_path);
              return (
                <li
                  key={doc.document_id}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {doc.document_type}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {doc.file_name} • {(doc.file_size / 1024).toFixed(1)} KB •{" "}
                      {formatDate(doc.created_at)}
                    </p>
                  </div>

                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Open document"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}

                  {canManage && onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(doc)}
                      aria-label="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
