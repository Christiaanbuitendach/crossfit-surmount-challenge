"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/history", label: "History", icon: "📜" },
  { href: "/leaderboard", label: "Ranks", icon: "🏆" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-navy-900/95 backdrop-blur">
      <div
        className="mx-auto flex max-w-md items-stretch justify-around"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`tap flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-semibold transition ${
                active ? "text-patriot-gold" : "text-white/55"
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
