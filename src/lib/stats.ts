import type { RepEntry, UserStats } from "@/types";
import type { MovementKey } from "@/lib/challenge";
import { addDays, CHALLENGE, daysElapsed, todayStr } from "@/lib/challenge";

// ----------------------------------------------------------------------------
// Pure stat calculations derived from a user's rep entries.
// ----------------------------------------------------------------------------

/**
 * Current streak = number of consecutive calendar days, counting back from
 * today, that have at least one entry. A one-day grace is allowed: if there is
 * no entry today but there is one yesterday, the streak counts from yesterday
 * (so you don't "lose" your streak just because you haven't logged yet today).
 */
function currentStreak(dateSet: Set<string>, today: string): number {
  let cursor = today;
  if (!dateSet.has(cursor)) {
    cursor = addDays(today, -1);
    if (!dateSet.has(cursor)) return 0;
  }
  let streak = 0;
  while (dateSet.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Longest run of consecutive logged days anywhere in the user's history. */
function longestStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    if (sortedDates[i] === addDays(sortedDates[i - 1], 1)) {
      run++;
    } else if (sortedDates[i] !== sortedDates[i - 1]) {
      run = 1;
    }
    if (run > best) best = run;
  }
  return best;
}

export function computeStats(entries: RepEntry[]): UserStats {
  const byMovement: Record<MovementKey, number> = {
    pushups: 0,
    situps: 0,
    airsquats: 0,
  };
  let total = 0;
  const dateSet = new Set<string>();

  for (const e of entries) {
    total += e.reps;
    byMovement[e.movement] += e.reps;
    dateSet.add(e.entry_date);
  }

  const sortedDates = Array.from(dateSet).sort();

  return {
    total,
    byMovement,
    currentStreak: currentStreak(dateSet, todayStr()),
    longestStreak: longestStreak(sortedDates),
  };
}

export interface PaceInfo {
  expected: number; // reps you "should" have by today to stay on pace
  diff: number; // total - expected (positive = ahead, negative = behind)
  status: "ahead" | "behind" | "even" | "not-started";
}

/** Proportional pace target across the 34-day window. */
export function computePace(total: number, today = todayStr()): PaceInfo {
  const elapsed = daysElapsed(today);
  if (elapsed === 0) {
    return { expected: 0, diff: total, status: "not-started" };
  }
  const expected = Math.round((CHALLENGE.goal * elapsed) / CHALLENGE.totalDays);
  const diff = total - expected;
  const status = diff > 0 ? "ahead" : diff < 0 ? "behind" : "even";
  return { expected, diff, status };
}
