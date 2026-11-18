import { cn, initials } from "@/lib/utils";

const SIZES = {
  sm: "size-8 text-[0.65rem]",
  md: "size-10 text-xs",
  lg: "size-16 text-lg",
  xl: "size-24 text-2xl",
  hero: "size-28 text-3xl",
};

export function Avatar({
  firstName,
  lastName,
  size = "md",
  className,
  tone = "blue",
}: {
  firstName: string;
  lastName: string;
  size?: keyof typeof SIZES;
  className?: string;
  tone?: "blue" | "navy" | "soft";
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full border font-bold tracking-tight",
        SIZES[size],
        tone === "navy" && "border-white/25 bg-white/10 text-white",
        tone === "blue" && "border-transparent bg-navy text-white",
        tone === "soft" && "border-line bg-surface-muted text-ink-soft",
        className,
      )}
      aria-hidden="true"
    >
      {initials(firstName, lastName)}
    </span>
  );
}

export function AvatarPair({
  first,
  second,
  size = "md",
}: {
  first: { firstName: string; lastName: string };
  second: { firstName: string; lastName: string };
  size?: keyof typeof SIZES;
}) {
  return (
    <span className="flex -space-x-2">
      <Avatar firstName={first.firstName} lastName={first.lastName} size={size} className="ring-2 ring-surface" />
      <Avatar firstName={second.firstName} lastName={second.lastName} size={size} className="ring-2 ring-surface" tone="soft" />
    </span>
  );
}
