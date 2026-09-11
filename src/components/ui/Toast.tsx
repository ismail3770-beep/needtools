"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const KIND_STYLES: Record<ToastKind, { icon: React.ReactNode; classes: string }> = {
  success: {
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    classes: "border-emerald-200 dark:border-emerald-800",
  },
  error: {
    icon: <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />,
    classes: "border-rose-200 dark:border-rose-800",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    classes: "border-amber-200 dark:border-amber-800",
  },
  info: {
    icon: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
    classes: "border-blue-200 dark:border-blue-800",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-2), { id, kind, message }]); // max 3 visible
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Fixed toast tray — top on mobile, bottom-right on desktop */}
      <div
        aria-live="polite"
        className="fixed z-[100] inset-x-3 top-3 sm:inset-x-auto sm:top-auto sm:bottom-5 sm:right-5 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border shadow-xl text-sm font-medium text-slate-800 dark:text-slate-100 animate-fade-in ${KIND_STYLES[t.kind].classes}`}
          >
            {KIND_STYLES[t.kind].icon}
            <span className="flex-1 text-xs sm:text-sm">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
