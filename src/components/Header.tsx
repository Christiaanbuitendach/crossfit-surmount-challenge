import { Logo } from "@/components/Logo";
import { signOut } from "@/auth";

/** App header with the gym logo and a sign-out control. */
export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-navy-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2">
        <Logo height={40} />
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="tap rounded-lg px-3 text-xs font-semibold text-white/60 hover:text-white"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
