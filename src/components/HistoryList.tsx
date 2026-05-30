"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEntryAction, updateEntryAction } from "@/app/actions";
import { useToast } from "@/components/Toast";
import { MOVEMENTS, MOVEMENT_LABELS, formatDateLabel } from "@/lib/challenge";
import type { RepEntry } from "@/types";

const EMOJI = Object.fromEntries(MOVEMENTS.map((m) => [m.key, m.emoji]));

export function HistoryList({ entries }: { entries: RepEntry[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, RepEntry[]>();
    for (const e of entries) {
      const arr = map.get(e.entry_date) ?? [];
      arr.push(e);
      map.set(e.entry_date, arr);
    }
    // entries arrive newest-first already; keep date order as-is
    return Array.from(map.entries());
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-2 p-8 text-center">
        <span className="text-4xl">📭</span>
        <p className="font-semibold text-white">No reps logged yet</p>
        <p className="text-sm text-white/60">
          Head to the dashboard to log your first set.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {grouped.map(([date, items]) => {
        const dayTotal = items.reduce((s, e) => s + e.reps, 0);
        return (
          <section key={date}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-patriot-gold">
                {formatDateLabel(date)}
              </h2>
              <span className="text-xs font-semibold text-white/50">
                {dayTotal.toLocaleString()} reps
              </span>
            </div>
            <div className="space-y-2">
              {items.map((entry) => (
                <EntryRow key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function EntryRow({ entry }: { entry: RepEntry }) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [reps, setReps] = useState(String(entry.reps));

  function save() {
    const repsNum = parseInt(reps, 10);
    if (!repsNum || repsNum <= 0) {
      toast.error("Reps must be greater than 0.");
      return;
    }
    startTransition(async () => {
      const res = await updateEntryAction({ id: entry.id, reps: repsNum });
      if (!res.ok) {
        toast.error(res.error ?? "Update failed.");
        return;
      }
      toast.success("Entry updated.");
      setEditing(false);
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await deleteEntryAction({ id: entry.id });
      if (!res.ok) {
        toast.error(res.error ?? "Delete failed.");
        return;
      }
      toast.success("Entry deleted.");
      router.refresh();
    });
  }

  return (
    <div className="card flex items-center gap-3 p-3">
      <span className="text-2xl">{EMOJI[entry.movement]}</span>

      <div className="flex-1">
        <p className="font-bold text-white">{MOVEMENT_LABELS[entry.movement]}</p>
        {editing ? (
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="mt-1 w-24 rounded-lg border border-white/10 bg-navy-900 px-2 py-1 text-sm font-bold text-white outline-none focus:border-patriot-gold"
            autoFocus
          />
        ) : (
          <p className="text-sm text-white/60">
            {entry.reps.toLocaleString()} reps
          </p>
        )}
      </div>

      {editing ? (
        <div className="flex gap-1">
          <button
            onClick={save}
            disabled={isPending}
            className="tap rounded-lg bg-patriot-gold px-3 text-sm font-bold text-navy-900 disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setReps(String(entry.reps));
            }}
            className="tap rounded-lg px-2 text-sm font-semibold text-white/60"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-1">
          <button
            onClick={() => setEditing(true)}
            aria-label="Edit"
            className="tap rounded-lg px-3 text-sm font-semibold text-white/70 hover:text-white"
          >
            Edit
          </button>
          <button
            onClick={remove}
            disabled={isPending}
            aria-label="Delete"
            className="tap rounded-lg px-3 text-sm font-semibold text-patriot-red disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
