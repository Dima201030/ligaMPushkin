"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Image blur-up (LQIP-style) — soft canvas until loaded. */
export function BlurImage({
  src,
  alt = "",
  className,
  imgClassName,
}: {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("blur-up", loaded && "blur-up-ready", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn("blur-up-img", imgClassName)}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
