"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "a2hs-dismissed";

/**
 * Subtle, dismissible "Add to Home Screen" banner for iOS Safari (which has no
 * beforeinstallprompt event). Only shown on mobile, when not already installed,
 * and not previously dismissed.
 */
export function AddToHomeScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    if (dismissed) return;

    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari standalone flag
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;

    if (isIOS && !isStandalone) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-md px-4 sm:bottom-4">
      <div className="animate-fade-in-up flex items-center gap-3 rounded-xl border border-patriot-gold/40 bg-navy-700/95 px-4 py-3 text-sm text-white shadow-glow backdrop-blur">
        <span className="text-xl">📲</span>
        <p className="flex-1 leading-snug">
          Add to your Home Screen: tap{" "}
          <span className="font-bold">Share</span> then{" "}
          <span className="font-bold">Add to Home Screen</span>.
        </p>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="tap -mr-2 rounded-lg px-2 text-white/60 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
