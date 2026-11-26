"use client";

import { CountUp } from "@/components/motion/CountUp";
import { OrgStat } from "@/components/organizer/OrganizerUI";

/** Organizer dashboard counter with count-up. */
export function OrgStatCount({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: number;
  hint?: string;
  icon?: React.ReactNode;
  tone?: "accent" | "positive" | "warning" | "negative" | "neutral";
}) {
  return (
    <OrgStat
      label={label}
      value={<CountUp value={value} />}
      hint={hint}
      icon={icon}
      tone={tone}
    />
  );
}
