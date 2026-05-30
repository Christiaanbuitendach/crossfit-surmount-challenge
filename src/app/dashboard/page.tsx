import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getEntriesByUser } from "@/lib/db";
import { computeStats, computePace } from "@/lib/stats";
import { evaluateBadges, earnedBadgeIds } from "@/lib/badges";
import { CHALLENGE, MOVEMENTS, clampToChallenge, todayStr } from "@/lib/challenge";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ProgressRing } from "@/components/ProgressRing";
import { BadgeGrid } from "@/components/BadgeGrid";
import { QuickAddForm } from "@/components/QuickAddForm";
import { AddToHomeScreen } from "@/components/AddToHomeScreen";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const entries = await getEntriesByUser(session.user.id);
  const stats = computeStats(entries);
  const pace = computePace(stats.total);
  const badges = evaluateBadges(stats);
  const firstName = (session.user.name ?? "Athlete").split(" ")[0];
  const defaultDate = clampToChallenge(todayStr());

  return (
    <div className="stars-bg min-h-[100dvh]">
      <Header />

      <main className="mx-auto max-w-md space-y-5 px-4 pb-28 pt-4">
        {/* Greeting */}
        <div className="flex items-center gap-3">
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt=""
              className="h-12 w-12 rounded-full border-2 border-patriot-gold object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-patriot-gold bg-navy-700 text-lg font-black">
              {firstName.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-sm text-white/60">Welcome back,</p>
            <h1 className="text-xl font-black text-white">{firstName} 🇺🇸</h1>
          </div>
        </div>

        {/* Progress ring */}
        <div className="card flex flex-col items-center gap-4 p-6">
          <ProgressRing value={stats.total} goal={CHALLENGE.goal} />

          {/* Pace + streak */}
          <div className="grid w-full grid-cols-2 gap-3">
            <PaceCard pace={pace} />
            <StreakCard streak={stats.currentStreak} />
          </div>

          {/* Movement breakdown */}
          <div className="grid w-full grid-cols-3 gap-2">
            {MOVEMENTS.map((m) => (
              <div
                key={m.key}
                className="flex flex-col items-center rounded-xl bg-navy-700 py-3"
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="text-lg font-black tabular-nums text-white">
                  {stats.byMovement[m.key].toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-white/50">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick add */}
        <QuickAddForm
          defaultDate={defaultDate}
          initialEarnedBadgeIds={earnedBadgeIds(stats)}
        />

        {/* Badges */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-patriot-gold">
            Badges
          </h2>
          <BadgeGrid badges={badges} />
        </section>
      </main>

      <AddToHomeScreen />
      <BottomNav />
    </div>
  );
}

function PaceCard({
  pace,
}: {
  pace: ReturnType<typeof computePace>;
}) {
  let headline: string;
  let tone: string;

  if (pace.status === "not-started") {
    headline = "Challenge not started yet";
    tone = "text-white/70";
  } else if (pace.status === "ahead") {
    headline = `${pace.diff.toLocaleString()} reps ahead`;
    tone = "text-patriot-gold";
  } else if (pace.status === "behind") {
    headline = `${Math.abs(pace.diff).toLocaleString()} reps behind`;
    tone = "text-patriot-red";
  } else {
    headline = "Right on pace";
    tone = "text-white";
  }

  return (
    <div className="rounded-xl bg-navy-700 p-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">
        Pace
      </p>
      <p className={`mt-1 text-sm font-black leading-tight ${tone}`}>
        {headline}
      </p>
    </div>
  );
}

function StreakCard({ streak }: { streak: number }) {
  return (
    <div className="rounded-xl bg-navy-700 p-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">
        Streak
      </p>
      <p className="mt-1 text-sm font-black leading-tight text-white">
        {streak === 0 ? "No streak yet" : `🔥 ${streak} day${streak === 1 ? "" : "s"}`}
      </p>
    </div>
  );
}
