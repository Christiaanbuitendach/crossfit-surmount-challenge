// ----------------------------------------------------------------------------
// Challenge constants & date math.
//
// All challenge dates are handled as plain "YYYY-MM-DD" strings interpreted in
// a fixed calendar (no time zones) so that a rep logged for "June 3" is always
// June 3 regardless of the user's device time zone.
// ----------------------------------------------------------------------------

export const CHALLENGE = {
  name: "1776 CrossFit Surmount Challenge",
  shortName: "1776 Challenge",
  goal: 1776,
  startDate: "2026-06-01",
  endDate: "2026-07-04",
  totalDays: 34, // June 1 through July 4 inclusive
} as const;

export type MovementKey = "pushups" | "situps" | "airsquats";

export const MOVEMENTS: {
  key: MovementKey;
  label: string;
  short: string;
  emoji: string;
}[] = [
  { key: "pushups", label: "Push-ups", short: "Push", emoji: "🙇" },
  { key: "situps", label: "Sit-ups", short: "Sit", emoji: "🪑" },
  { key: "airsquats", label: "Air Squats", short: "Squat", emoji: "🦵" },
];

export const MOVEMENT_LABELS: Record<MovementKey, string> = {
  pushups: "Push-ups",
  situps: "Sit-ups",
  airsquats: "Air Squats",
};

export function isMovementKey(value: string): value is MovementKey {
  return value === "pushups" || value === "situps" || value === "airsquats";
}

// --- Date helpers (all operate on "YYYY-MM-DD" strings) -------------------

/** Today as a YYYY-MM-DD string in the viewer's local calendar. */
export function todayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse "YYYY-MM-DD" into a UTC-noon Date (avoids DST/timezone drift). */
function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

/** Add `days` to a "YYYY-MM-DD" string, returning a new "YYYY-MM-DD" string. */
export function addDays(s: string, days: number): string {
  const dt = parseDate(s);
  dt.setUTCDate(dt.getUTCDate() + days);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Whole days from a → b (b - a). Negative if b is before a. */
export function daysBetween(a: string, b: string): number {
  const ms = parseDate(b).getTime() - parseDate(a).getTime();
  return Math.round(ms / 86_400_000);
}

/** Clamp a date string into the [startDate, endDate] challenge window. */
export function clampToChallenge(s: string): string {
  if (s < CHALLENGE.startDate) return CHALLENGE.startDate;
  if (s > CHALLENGE.endDate) return CHALLENGE.endDate;
  return s;
}

/**
 * Number of challenge days elapsed (1..totalDays) as of `today`.
 * 0 before the challenge starts; full totalDays once it has ended.
 */
export function daysElapsed(today: string): number {
  if (today < CHALLENGE.startDate) return 0;
  if (today >= CHALLENGE.endDate) return CHALLENGE.totalDays;
  return daysBetween(CHALLENGE.startDate, today) + 1;
}

/** Human-friendly date label, e.g. "Wed, Jun 3". */
export function formatDateLabel(s: string): string {
  return parseDate(s).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
