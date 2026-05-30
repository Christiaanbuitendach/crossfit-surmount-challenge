import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLeaderboard } from "@/lib/db";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Leaderboard } from "@/components/Leaderboard";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const rows = await getLeaderboard();

  return (
    <div className="stars-bg min-h-[100dvh]">
      <Header />
      <main className="mx-auto max-w-md px-4 pb-28 pt-4">
        <h1 className="mb-4 text-xl font-black text-white">Leaderboard 🏆</h1>
        <Leaderboard rows={rows} currentUserId={session.user.id} />
      </main>
      <BottomNav />
    </div>
  );
}
