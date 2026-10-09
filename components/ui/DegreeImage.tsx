"use client";

import Image from "next/image";
import { useState } from "react";

const source = "/official-assets/mau-phoi-bang.png";

export function DegreeImage() {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [original, setOriginal] = useState(false);
  const [attempt, setAttempt] = useState(0);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line-200 bg-canvas shadow-sm">
      {status !== "error" && (
        <Image
          key={`${original}-${attempt}`}
          src={source}
          alt="Mẫu phôi bằng cử nhân của Trường Đại học Phú Xuân theo phương thức đào tạo từ xa"
          fill
          unoptimized={original}
          className="object-contain"
          sizes="(max-width: 1023px) 100vw, 600px"
          onLoad={() => setStatus("loaded")}
          onError={() => {
            if (!original) setOriginal(true);
            else setStatus("error");
          }}
        />
      )}
      {status === "loading" && (
        <p
          role="status"
          className="absolute inset-0 flex items-center justify-center bg-canvas p-6 text-body-sm text-ink-600"
        >
          Đang tải mẫu bằng…
        </p>
      )}
      {status === "error" && (
        <div
          role="alert"
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-body-sm text-ink-600"
        >
          <p>Chưa tải được mẫu bằng.</p>
          <button
            type="button"
            className="min-h-11 rounded-md border border-line-200 px-4 font-semibold text-brand-700"
            onClick={() => {
              setAttempt((value) => value + 1);
              setStatus("loading");
            }}
          >
            Thử tải lại
          </button>
          <a
            href={source}
            target="_blank"
            rel="noreferrer"
            className="min-h-11 content-center font-semibold text-brand-700 underline"
          >
            Mở ảnh gốc
          </a>
        </div>
      )}
    </div>
  );
}
