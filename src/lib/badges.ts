import type { UserStats } from "@/types";

// ----------------------------------------------------------------------------
// Badge definitions. Each badge has a pure `earned()` predicate over a user's
// stats so the same logic powers both display and unlock detection.
// ----------------------------------------------------------------------------

export interface BadgeDef {
  id: string;
  label: string;
  emoji: string;
  description: string;
  earned: (s: UserStats) => boolean;
}

export const BADGES: BadgeDef[] = [
  {
    id: "off-the-couch",
    label: "Off the Couch",
    emoji: "🛋️",
    description: "Reach 444 reps (25%)",
    earned: (s) => s.total >= 444,
  },
  {
    id: "getting-spicy",
    label: "Getting Spicy",
    emoji: "🌶️",
    description: "Reach 888 reps (50%)",
    earned: (s) => s.total >= 888,
  },
  {
    id: "send-it",
    label: "Send It",
    emoji: "🚀",
    description: "Reach 1,332 reps (75%)",
    earned: (s) => s.total >= 1332,
  },
  {
    id: "freedom-fighter",
    label: "Freedom Fighter",
    emoji: "🦅",
    description: "Reach 1,776 reps (100%)",
    earned: (s) => s.total >= 1776,
  },
  {
    id: "no-excuses",
    label: "No Excuses",
    emoji: "💪",
    description: "Log every movement",
    earned: (s) =>
      s.byMovement.pushups > 0 &&
      s.byMovement.situps > 0 &&
      s.byMovement.airsquats > 0,
  },
  {
    id: "beast-mode",
    label: "Beast Mode",
    emoji: "🔥",
    description: "7-day logging streak",
    earned: (s) => s.longestStreak >= 7,
  },
];

export interface BadgeStatus {
  def: BadgeDef;
  earned: boolean;
}

export function evaluateBadges(stats: UserStats): BadgeStatus[] {
  return BADGES.map((def) => ({ def, earned: def.earned(stats) }));
}

/** IDs of all currently-earned badges (used to detect new unlocks). */
export function earnedBadgeIds(stats: UserStats): string[] {
  return BADGES.filter((b) => b.earned(stats)).map((b) => b.id);
}
