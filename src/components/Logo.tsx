"use client";

import { useState } from "react";

const LOGO_URL =
  "https://crossfitsurmount.com/wp-content/uploads/2022/05/CrossFit-Surmount_Final.jpg";

/**
 * CrossFit Surmount logo. Loads the real logo from the gym's site and falls
 * back to a styled text wordmark if the image can't be fetched.
 */
export function Logo({
  className = "",
  height = 48,
}: {
  className?: string;
  height?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`inline-flex flex-col items-center justify-center leading-none ${className}`}
        style={{ height }}
      >
        <span className="text-xs font-black uppercase tracking-[0.2em] text-patriot-gold">
          CrossFit
        </span>
        <span className="text-lg font-black uppercase tracking-widest text-white">
          Surmount
        </span>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_URL}
      alt="CrossFit Surmount"
      height={height}
      style={{ height }}
      className={`w-auto rounded-md bg-white/95 p-1 ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
