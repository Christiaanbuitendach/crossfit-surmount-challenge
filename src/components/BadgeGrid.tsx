import type { BadgeStatus } from "@/lib/badges";

/** Earned badges shown in full color; locked ones greyed out. */
export function BadgeGrid({ badges }: { badges: BadgeStatus[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {badges.map(({ def, earned }) => (
        <div
          key={def.id}
          className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition ${
            earned
              ? "border-patriot-gold/50 bg-navy-700 shadow-glow"
              : "border-white/10 bg-navy-800/60"
          }`}
        >
          <span
            className={`text-3xl ${earned ? "" : "opacity-30 grayscale"}`}
            aria-hidden
          >
            {earned ? def.emoji : "🔒"}
          </span>
          <span
            className={`text-[11px] font-bold leading-tight ${
              earned ? "text-white" : "text-white/40"
            }`}
          >
            {def.label}
          </span>
          <span className="text-[9px] leading-tight text-white/40">
            {def.description}
          </span>
        </div>
      ))}
    </div>
  );
}
