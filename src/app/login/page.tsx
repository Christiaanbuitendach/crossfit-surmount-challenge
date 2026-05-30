import { signIn } from "@/auth";
import { Logo } from "@/components/Logo";
import { CHALLENGE } from "@/lib/challenge";

export default function LoginPage() {
  return (
    <main className="stars-bg flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <Logo height={96} className="shadow-glow" />

        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-patriot-gold">
            1776 Challenge
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-white">
            CrossFit Surmount
            <br />
            <span className="text-patriot-red">Challenge Tracker</span>
          </h1>
          <p className="mt-3 text-sm text-white/70">
            Accumulate <span className="font-bold text-white">1,776 reps</span>{" "}
            of push-ups, sit-ups &amp; air squats.
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/50">
            June 1 – July 4, 2026
          </p>
        </div>

        {/* Decorative stripes */}
        <div className="flex w-full gap-1">
          <div className="h-1.5 flex-1 rounded-full bg-patriot-red" />
          <div className="h-1.5 flex-1 rounded-full bg-white" />
          <div className="h-1.5 flex-1 rounded-full bg-patriot-gold" />
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
          className="w-full"
        >
          <button type="submit" className="btn-primary w-full bg-white !text-navy-900">
            <GoogleIcon />
            Sign in with Google
          </button>
        </form>

        <p className="text-center text-xs text-white/40">
          {CHALLENGE.name}
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
