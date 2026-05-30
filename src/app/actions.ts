"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { addEntry, deleteEntry, getEntriesByUser, updateEntry } from "@/lib/db";
import { computeStats } from "@/lib/stats";
import { earnedBadgeIds } from "@/lib/badges";
import {
  CHALLENGE,
  isMovementKey,
  type MovementKey,
} from "@/lib/challenge";

// ----------------------------------------------------------------------------
// Server actions for rep entries. Each one re-authenticates, validates input,
// performs the mutation, then returns fresh totals + earned-badge ids so the
// client can update optimistically and surface badge-unlock toasts.
// ----------------------------------------------------------------------------

export interface ActionResult {
  ok: boolean;
  error?: string;
  total?: number;
  earnedBadgeIds?: string[];
}

function validateReps(reps: number): string | null {
  if (!Number.isFinite(reps) || !Number.isInteger(reps)) {
    return "Reps must be a whole number.";
  }
  if (reps <= 0) return "Reps must be greater than 0.";
  if (reps > 100000) return "That's a few too many reps.";
  return null;
}

function validateDate(date: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Invalid date.";
  if (date < CHALLENGE.startDate || date > CHALLENGE.endDate) {
    return `Date must be between ${CHALLENGE.startDate} and ${CHALLENGE.endDate}.`;
  }
  return null;
}

async function freshResult(userId: string): Promise<ActionResult> {
  const entries = await getEntriesByUser(userId);
  const stats = computeStats(entries);
  return { ok: true, total: stats.total, earnedBadgeIds: earnedBadgeIds(stats) };
}

export async function addEntryAction(input: {
  movement: string;
  reps: number;
  entryDate: string;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  if (!isMovementKey(input.movement)) {
    return { ok: false, error: "Pick a movement." };
  }
  const repsErr = validateReps(input.reps);
  if (repsErr) return { ok: false, error: repsErr };
  const dateErr = validateDate(input.entryDate);
  if (dateErr) return { ok: false, error: dateErr };

  try {
    await addEntry({
      userId: session.user.id,
      movement: input.movement as MovementKey,
      reps: input.reps,
      entryDate: input.entryDate,
    });
  } catch (e) {
    return { ok: false, error: "Could not save your reps. Try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/leaderboard");
  return freshResult(session.user.id);
}

export async function updateEntryAction(input: {
  id: string;
  reps: number;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const repsErr = validateReps(input.reps);
  if (repsErr) return { ok: false, error: repsErr };

  try {
    const updated = await updateEntry({
      id: input.id,
      userId: session.user.id,
      reps: input.reps,
    });
    if (!updated) return { ok: false, error: "Entry not found." };
  } catch (e) {
    return { ok: false, error: "Could not update the entry. Try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/leaderboard");
  return freshResult(session.user.id);
}

export async function deleteEntryAction(input: {
  id: string;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  try {
    await deleteEntry({ id: input.id, userId: session.user.id });
  } catch (e) {
    return { ok: false, error: "Could not delete the entry. Try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/leaderboard");
  return freshResult(session.user.id);
}
