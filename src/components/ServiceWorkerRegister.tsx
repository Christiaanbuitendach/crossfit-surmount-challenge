"use client";

import { useEffect } from "react";

/** Registers the offline-shell service worker once on mount. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration failures are non-fatal */
      });
    };
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
