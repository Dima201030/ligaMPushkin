import { cn } from "@/lib/utils";

export { WinRateRing } from "./WinRateRing";
export { RatingChart } from "./RatingChart";

export function FormDots({ form }: { form: number[] }) {
  return (
    <div className="flex items-center gap-1" aria-label="Форма в последних матчах">
      {form.map((delta, index) => (
        <span
          key={index}
          title={delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "0"}
          className={cn(
            "grid size-5 place-items-center rounded-full text-[0.55rem] font-bold",
            delta > 0 && "bg-positive-soft text-positive",
            delta < 0 && "bg-negative-soft text-negative",
            delta === 0 && "bg-surface-hover text-ink-faint",
          )}
        >
          {delta > 0 ? "+" : delta === 0 ? "0" : "−"}
        </span>
      ))}
    </div>
  );
}
