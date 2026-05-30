import "server-only";

import { supabaseAdmin } from "@/lib/supabase";
import type { DbUser, LeaderboardRow, RepEntry } from "@/types";
import type { MovementKey } from "@/lib/challenge";

// ----------------------------------------------------------------------------
// Data access layer. Everything here runs on the server with the service-role
// client. Keep this the single source of truth for database queries.
// ----------------------------------------------------------------------------

const EMPTY_BY_MOVEMENT = (): Record<MovementKey, number> => ({
  pushups: 0,
  situps: 0,
  airsquats: 0,
});

/** Create the user on first login, or refresh their profile on later logins. */
export async function upsertUser(input: {
  googleId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}): Promise<DbUser> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .upsert(
      {
        google_id: input.googleId,
        name: input.name,
        email: input.email,
        avatar_url: input.avatarUrl,
      },
      { onConflict: "google_id" }
    )
    .select("*")
    .single();

  if (error) throw new Error(`upsertUser failed: ${error.message}`);
  return data as DbUser;
}

export async function getUserById(id: string): Promise<DbUser | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getUserById failed: ${error.message}`);
  return (data as DbUser) ?? null;
}

export async function getEntriesByUser(userId: string): Promise<RepEntry[]> {
  const { data, error } = await supabaseAdmin
    .from("rep_entries")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(`getEntriesByUser failed: ${error.message}`);
  return (data as RepEntry[]) ?? [];
}

export async function addEntry(input: {
  userId: string;
  movement: MovementKey;
  reps: number;
  entryDate: string;
}): Promise<RepEntry> {
  const { data, error } = await supabaseAdmin
    .from("rep_entries")
    .insert({
      user_id: input.userId,
      movement: input.movement,
      reps: input.reps,
      entry_date: input.entryDate,
    })
    .select("*")
    .single();
  if (error) throw new Error(`addEntry failed: ${error.message}`);
  return data as RepEntry;
}

/** Update reps on an entry, scoped to the owning user. */
export async function updateEntry(input: {
  id: string;
  userId: string;
  reps: number;
}): Promise<RepEntry | null> {
  const { data, error } = await supabaseAdmin
    .from("rep_entries")
    .update({ reps: input.reps })
    .eq("id", input.id)
    .eq("user_id", input.userId)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`updateEntry failed: ${error.message}`);
  return (data as RepEntry) ?? null;
}

/** Delete an entry, scoped to the owning user. */
export async function deleteEntry(input: {
  id: string;
  userId: string;
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from("rep_entries")
    .delete()
    .eq("id", input.id)
    .eq("user_id", input.userId);
  if (error) throw new Error(`deleteEntry failed: ${error.message}`);
}

/**
 * Build the full leaderboard: every user with their totals and per-movement
 * breakdown. Fine to aggregate in JS for the expected ~10–20 users.
 */
export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const [{ data: users, error: usersErr }, { data: entries, error: entriesErr }] =
    await Promise.all([
      supabaseAdmin.from("users").select("id, name, avatar_url"),
      supabaseAdmin.from("rep_entries").select("user_id, movement, reps"),
    ]);

  if (usersErr) throw new Error(`getLeaderboard users failed: ${usersErr.message}`);
  if (entriesErr)
    throw new Error(`getLeaderboard entries failed: ${entriesErr.message}`);

  const rows = new Map<string, LeaderboardRow>();
  for (const u of users ?? []) {
    rows.set(u.id, {
      userId: u.id,
      name: u.name,
      avatarUrl: u.avatar_url,
      total: 0,
      byMovement: EMPTY_BY_MOVEMENT(),
    });
  }

  for (const e of (entries ?? []) as Pick<
    RepEntry,
    "user_id" | "movement" | "reps"
  >[]) {
    const row = rows.get(e.user_id);
    if (!row) continue;
    row.total += e.reps;
    row.byMovement[e.movement] += e.reps;
  }

  return Array.from(rows.values()).sort((a, b) => b.total - a.total);
}
