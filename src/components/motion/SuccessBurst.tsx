"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Soft checkmark + confetti-lite after signup success. */
export function SuccessBurst({
  active,
  label = "Готово",
  className,
}: {
  active: boolean;
  label?: string;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    setShow(true);
    const id = window.setTimeout(() => setShow(false), reduced ? 1200 : 2400);
    return () => window.clearTimeout(id);
  }, [active, reduced]);

  if (!show) return null;

  return (
    <div className={cn("success-burst", className)} role="status">
      <span className="success-burst-check">
        <Check className="size-5" aria-hidden="true" />
      </span>
      <span className="text-sm font-medium text-positive">{label}</span>
      {!reduced ? (
        <span className="success-burst-sparks" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <i key={i} style={{ ["--i" as string]: i }} />
          ))}
        </span>
      ) : null}
    </div>
  );
}
