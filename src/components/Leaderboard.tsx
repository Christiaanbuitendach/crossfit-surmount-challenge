"use client";

import { useMemo, useState } from "react";
import { CHALLENGE, type MovementKey } from "@/lib/challenge";
import type { LeaderboardRow } from "@/types";

type Tab = "overall" | MovementKey;

const TABS: { key: Tab; label: string }[] = [
  { key: "overall", label: "Overall" },
  { key: "pushups", label: "Push-ups" },
  { key: "situps", label: "Sit-ups" },
  { key: "airsquats", label: "Air Squats" },
];

export function Leaderboard({
  rows,
  currentUserId,
}: {
  rows: LeaderboardRow[];
  currentUserId: string;
}) {
  const [tab, setTab] = useState<Tab>("overall");

  const ranked = useMemo(() => {
    const valueFor = (r: LeaderboardRow) =>
      tab === "overall" ? r.total : r.byMovement[tab];
    return [...rows]
      .map((r) => ({ row: r, value: valueFor(r) }))
      .sort((a, b) => b.value - a.value);
  }, [rows, tab]);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-navy-800 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tap flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition ${
              tab === t.key
                ? "bg-patriot-red text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Rows */}
      {ranked.length === 0 ? (
        <div className="card p-8 text-center text-sm text-white/60">
          No athletes yet. Be the first to log reps!
        </div>
      ) : (
        <ol className="space-y-2">
          {ranked.map(({ row, value }, i) => {
            const isMe = row.userId === currentUserId;
            const pct =
              tab === "overall"
                ? Math.min(100, Math.round((value / CHALLENGE.goal) * 100))
                : null;
            return (
              <li
                key={row.userId}
                className={`card flex items-center gap-3 p-3 ${
                  isMe ? "border-patriot-gold ring-1 ring-patriot-gold" : ""
                }`}
              >
                <span className="w-6 text-center text-lg font-black text-patriot-gold">
                  {i + 1}
                </span>

                {row.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.avatarUrl}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-700 font-black text-white">
                    {row.name.charAt(0)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate font-bold text-white">
                      {row.name}
                      {isMe && (
                        <span className="ml-1 text-xs font-semibold text-patriot-gold">
                          (you)
                        </span>
                      )}
                    </p>
                    <p className="shrink-0 font-black tabular-nums text-white">
                      {value.toLocaleString()}
                    </p>
                  </div>

                  {tab === "overall" && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-patriot-gold"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-white/50">
                        {pct}%
                      </span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
