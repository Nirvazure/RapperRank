"use client";

import { cn } from "@/lib/utils";

export function IntegerRatingButtons({
  label,
  value,
  values,
  valueLabels,
  onChange,
  tone = "lime",
}: {
  label: string;
  value: number;
  values: number[];
  valueLabels?: Partial<Record<number, string>>;
  onChange: (value: number) => void;
  tone?: "lime" | "red";
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-black uppercase text-white/55">{label}</span>
        <span
          className={cn(
            "font-mono text-sm font-black",
            tone === "red" ? "text-red-300" : "text-lime-200",
          )}
        >
          {value}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {values.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "h-9 rounded-md border text-sm font-black transition",
              value === option
                ? tone === "red"
                  ? "border-red-300 bg-red-300 text-black"
                  : "border-lime-200 bg-lime-200 text-black"
                : "border-white/10 bg-black/35 text-white/65 hover:border-white/35 hover:text-white",
            )}
          >
            {valueLabels?.[option] ?? option}
          </button>
        ))}
      </div>
    </div>
  );
}
