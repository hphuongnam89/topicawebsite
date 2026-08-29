"use client";

import { useState } from "react";
import { Link2, Share2, Check } from "lucide-react";
import { cn } from "@/components/ui/cn";

interface ArticleShareProps {
  title: string;
  className?: string;
}

export function ArticleShare({ title, className }: ArticleShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Failed to share", err);
        }
      }
    } else {
      // Fallback: copy link
      handleCopyLink();
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-body-sm font-medium text-ink-600 mr-2">Chia sẻ:</span>
      <button
        onClick={handleCopyLink}
        className="p-2 rounded-full hover:bg-paper text-ink-600 hover:text-ink-950 transition-colors"
        aria-label="Copy link"
        title="Sao chép liên kết"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
      </button>
      <button
        onClick={handleNativeShare}
        className="p-2 rounded-full hover:bg-paper text-ink-600 hover:text-ink-950 transition-colors"
        aria-label="Share article"
        title="Chia sẻ"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  );
}
