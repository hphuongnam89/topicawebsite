import * as React from "react";
import { FileText, Download, ExternalLink } from "lucide-react";
import { cn } from "./cn";

export interface DocumentCardProps {
  /** Document title */
  title: string;
  /** Document type label, e.g. "Đề án", "Quy chế", "Biểu mẫu" */
  type?: string;
  /** Date string, e.g. "Ban hành: 15/06/2026" */
  date?: string;
  /** File size, e.g. "2.4 MB" */
  fileSize?: string;
  /** URL to view the document */
  viewUrl?: string;
  /** URL to download the document */
  downloadUrl?: string;
  className?: string;
}

export function DocumentCard({
  title,
  type,
  date,
  fileSize,
  viewUrl,
  downloadUrl,
  className,
}: DocumentCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-lg border border-line-200 bg-canvas p-4 transition-colors hover:bg-paper sm:p-5",
        className,
      )}
    >
      {/* Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <FileText className="h-5 w-5" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h4 className="text-body font-semibold text-ink-950">{title}</h4>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-ink-600">
          {type && <span>{type}</span>}
          {date && <span>{date}</span>}
          {fileSize && <span>{fileSize}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {viewUrl && (
          <a
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center gap-1.5 rounded-md border border-line-200 px-3 text-body-sm font-medium text-ink-800 transition-colors hover:border-brand-500 hover:text-brand-700"
            aria-label={`Xem tài liệu: ${title}`}
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Xem</span>
          </a>
        )}
        {downloadUrl && (
          <a
            href={downloadUrl}
            download
            className="flex h-9 items-center gap-1.5 rounded-md bg-brand-700 px-3 text-body-sm font-medium text-white transition-colors hover:bg-brand-800"
            aria-label={`Tải xuống: ${title}`}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Tải xuống</span>
          </a>
        )}
      </div>
    </div>
  );
}

export interface DocumentListProps {
  documents: DocumentCardProps[];
  className?: string;
}

export function DocumentList({ documents, className }: DocumentListProps) {
  if (documents.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {documents.map((doc, index) => (
        <DocumentCard key={index} {...doc} />
      ))}
    </div>
  );
}
