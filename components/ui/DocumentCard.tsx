import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LocalizedElement } from "@/components/i18n/LocalizedElement";
import * as React from "react";
import Link from "@/components/i18n/LocalizedLink";
import { FileText, Download, ExternalLink, ArrowRight } from "lucide-react";
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
  const hasValidDownload = Boolean(downloadUrl && downloadUrl !== "#" && downloadUrl.trim() !== "");
  const hasValidView = Boolean(viewUrl && viewUrl !== "#" && viewUrl.trim() !== "");
  const isInternalView = Boolean(
    hasValidView &&
      viewUrl?.startsWith("/") &&
      !viewUrl.endsWith(".pdf") &&
      !viewUrl.endsWith(".docx")
  );

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-lg border border-line-200 bg-canvas p-4 transition-colors hover:bg-paper sm:p-5",
        className,
      )}
    >
      {/* Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-800">
        <FileText className="h-5 w-5" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h4 className="text-body font-semibold text-ink-950"><LocalizedText>{title}</LocalizedText></h4>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-ink-600">
          <LocalizedText>{type && <span><LocalizedText>{type}</LocalizedText></span>}</LocalizedText>
          <LocalizedText>{date && <span><LocalizedText>{date}</LocalizedText></span>}</LocalizedText>
          <LocalizedText>{hasValidDownload && fileSize && <span><LocalizedText>{fileSize}</LocalizedText></span>}</LocalizedText>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {hasValidView && (
          isInternalView ? (
            <Link
              href={viewUrl!}
              className="flex h-9 w-9 items-center justify-center gap-1.5 rounded-md border border-line-200 px-0 text-body-sm font-medium text-ink-800 transition-colors hover:border-navy-500 hover:text-navy-900 sm:h-9 sm:w-32 sm:px-2"
              aria-label={`Xem tài liệu: ${title}`}
            >
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline"><LocalizedText>Xem văn bản</LocalizedText></span>
            </Link>
          ) : (
            <LocalizedElement as="a"
              href={viewUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center gap-1.5 rounded-md border border-line-200 px-0 text-body-sm font-medium text-ink-800 transition-colors hover:border-navy-500 hover:text-navy-900 sm:h-9 sm:w-32 sm:px-2"
              aria-label={`Xem tài liệu: ${title}`}
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline"><LocalizedText>Xem</LocalizedText></span>
            </LocalizedElement>
          )
        )}

        {hasValidDownload && (
          <LocalizedElement as="a"
            href={downloadUrl!}
            download
            className="flex h-9 w-9 items-center justify-center gap-1.5 rounded-md bg-navy-900 px-0 text-body-sm font-medium text-white transition-colors hover:bg-navy-800 sm:h-9 sm:w-32 sm:px-2"
            aria-label={`Tải xuống: ${title}`}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline"><LocalizedText>Tải xuống</LocalizedText></span>
          </LocalizedElement>
        )}

        {!hasValidView && !hasValidDownload && (
          <span className="inline-flex items-center text-xs text-ink-500 bg-line-100 px-2.5 py-1 rounded font-medium">
            <LocalizedText>Bản số đang cập nhật
          </LocalizedText></span>
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
