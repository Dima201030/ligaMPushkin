"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

/** Prefetch route on hover / focus for snappier navigation. */
export function PrefetchLink({
  href,
  onMouseEnter,
  onFocus,
  ...rest
}: ComponentProps<typeof Link>) {
  const router = useRouter();

  function prefetch() {
    if (typeof href === "string") router.prefetch(href);
  }

  return (
    <Link
      href={href}
      onMouseEnter={(event) => {
        prefetch();
        onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        prefetch();
        onFocus?.(event);
      }}
      {...rest}
    />
  );
}
