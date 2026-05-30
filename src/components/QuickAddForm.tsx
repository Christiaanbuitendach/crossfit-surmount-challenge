"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addEntryAction } from "@/app/actions";
import { useToast } from "@/components/Toast";
import { BADGES } from "@/lib/badges";
import { CHALLENGE, MOVEMENTS, type MovementKey } from "@/lib/challenge";

const BADGE_BY_ID = Object.fromEntries(BADGES.map((b) => [b.id, b]));

export function QuickAddForm({
  defaultDate,
  initialEarnedBadgeIds,
}: {
  defaultDate: string;
  initialEarnedBadgeIds: string[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [movement, setMovement] = useState<MovementKey>("pushups");
  const [reps, setReps] = useState("");
  const [date, setDate] = useState(defaultDate);

  // Track known badges across submissions to detect new unlocks.
  const knownBadges = useRef<Set<string>>(new Set(initialEarnedBadgeIds));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const repsNum = parseInt(reps, 10);
    if (!repsNum || repsNum <= 0) {
      toast.error("Enter a rep count greater than 0.");
      return;
    }

    const label =
      MOVEMENTS.find((m) => m.key === movement)?.label ?? "reps";

    startTransition(async () => {
      const res = await addEntryAction({
        movement,
        reps: repsNum,
        entryDate: date,
      });

      if (!res.ok) {
        toast.error(res.error ?? "Something went wrong.");
        return;
      }

      toast.success(`+${repsNum} ${label} logged!`);
      setReps("");

      // Surface any newly unlocked badges.
      for (const id of res.earnedBadgeIds ?? []) {
        if (!knownBadges.current.has(id)) {
          knownBadges.current.add(id);
          const def = BADGE_BY_ID[id];
          if (def) {
            toast.badge(`Badge unlocked: ${def.label}`, def.emoji);
          }
        }
      }

      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="card p-4">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-patriot-gold">
        Log Reps
      </h2>

      {/* Movement selector */}
      <div className="grid grid-cols-3 gap-2">
        {MOVEMENTS.map((m) => {
          const active = movement === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setMovement(m.key)}
              className={`tap flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-sm font-bold transition active:scale-95 ${
                active
                  ? "border-patriot-gold bg-patriot-red text-white"
                  : "border-white/10 bg-navy-700 text-white/70"
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Reps + date */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-white/60">Reps</span>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={1}
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="0"
            className="tap w-full rounded-xl border border-white/10 bg-navy-900 px-4 py-3 text-lg font-bold text-white outline-none focus:border-patriot-gold"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-white/60">Date</span>
          <input
            type="date"
            value={date}
            min={CHALLENGE.startDate}
            max={CHALLENGE.endDate}
            onChange={(e) => setDate(e.target.value)}
            className="tap w-full rounded-xl border border-white/10 bg-navy-900 px-3 py-3 text-sm font-semibold text-white outline-none focus:border-patriot-gold"
          />
        </label>
      </div>

      <button type="submit" disabled={isPending} className="btn-gold mt-4 w-full">
        {isPending ? "Saving…" : "Add Reps"}
      </button>
    </form>
  );
}
