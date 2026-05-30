"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "error" | "badge" | "info";

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
  emoji?: string;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, "id">) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  badge: (message: string, emoji?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { ...t, id }]);
    const ttl = t.kind === "badge" ? 5000 : 3200;
    setTimeout(() => remove(id), ttl);
  }, [remove]);

  const value: ToastContextValue = {
    toast,
    success: (message) => toast({ kind: "success", message }),
    error: (message) => toast({ kind: "error", message }),
    badge: (message, emoji) => toast({ kind: "badge", message, emoji }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-8">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const styles: Record<ToastKind, string> = {
    success: "border-patriot-gold/40 bg-navy-700",
    error: "border-patriot-red/60 bg-navy-700",
    badge: "border-patriot-gold bg-navy-700 shadow-glow",
    info: "border-white/20 bg-navy-700",
  };
  const icon: Record<ToastKind, string> = {
    success: "✅",
    error: "⚠️",
    badge: toast.emoji ?? "🏅",
    info: "ℹ️",
  };
  return (
    <div
      role="status"
      onClick={onClose}
      className={`pointer-events-auto flex w-full max-w-sm animate-fade-in-up items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold text-white ${styles[toast.kind]}`}
    >
      <span className="text-xl leading-none">{icon[toast.kind]}</span>
      <span className="flex-1">{toast.message}</span>
    </div>
  );
}

/** Run-once effect helper to avoid duplicate effects in StrictMode dev. */
export function useOnce(fn: () => void) {
  useEffect(() => {
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
