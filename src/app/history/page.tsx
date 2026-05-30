import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getEntriesByUser } from "@/lib/db";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { HistoryList } from "@/components/HistoryList";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const entries = await getEntriesByUser(session.user.id);

  return (
    <div className="stars-bg min-h-[100dvh]">
      <Header />
      <main className="mx-auto max-w-md px-4 pb-28 pt-4">
        <h1 className="mb-4 text-xl font-black text-white">Log History</h1>
        <HistoryList entries={entries} />
      </main>
      <BottomNav />
    </div>
  );
}
