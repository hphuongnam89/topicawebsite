import Image from "next/image";
import { cn } from "@/components/ui/cn";
import type { ImageAsset } from "@/lib/cms/types";

interface ArticleHeroProps {
  image?: ImageAsset;
  title: string;
  caption?: string;
  className?: string;
}

export function ArticleHero({ image, title, caption, className }: ArticleHeroProps) {
  if (!image) return null;

  return (
    <figure className={cn("mb-10", className)}>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-paper md:aspect-[21/9]">
        <Image
          src={image.url}
          alt={image.alt || title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-body-sm text-ink-600 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
