import type { MovementKey } from "@/lib/challenge";

export interface DbUser {
  id: string;
  google_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

export interface RepEntry {
  id: string;
  user_id: string;
  movement: MovementKey;
  reps: number;
  entry_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

/** Aggregated per-user stats used across the dashboard & leaderboard. */
export interface UserStats {
  total: number;
  byMovement: Record<MovementKey, number>;
  currentStreak: number;
  longestStreak: number;
}

export interface LeaderboardRow {
  userId: string;
  name: string;
  avatarUrl: string | null;
  total: number;
  byMovement: Record<MovementKey, number>;
}
