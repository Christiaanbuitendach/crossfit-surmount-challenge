import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { CHALLENGE } from "@/lib/challenge";

export const metadata: Metadata = {
  title: `${CHALLENGE.name} Tracker`,
  description:
    "Track your 1,776-rep CrossFit Surmount challenge — push-ups, sit-ups, and air squats. June 1 – July 4, 2026.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: CHALLENGE.shortName,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0A1628",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
