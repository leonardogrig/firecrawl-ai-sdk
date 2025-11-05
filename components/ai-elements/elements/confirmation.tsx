'use client';

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Confirmation({
  children,
  state,
  approval,
}: {
  children: ReactNode;
  state: string;
  approval?: { id: string; approved?: boolean; reason?: string };
}) {
  const tone =
    state === "approval-requested"
      ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-100"
      : approval?.approved === false || state === "output-denied"
        ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
        : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200";

  return (
    <div className={cn("rounded-lg border p-3 text-xs", tone)} data-state={state}>
      {children}
    </div>
  );
}

export function ConfirmationTitle({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

export function ConfirmationRequest({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

export function ConfirmationAccepted({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-2 text-xs">{children}</div>;
}

export function ConfirmationRejected({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-2 text-xs">{children}</div>;
}

export function ConfirmationActions({ children }: { children: ReactNode }) {
  return <div className="mt-3 flex gap-2">{children}</div>;
}

export function ConfirmationAction({
  children,
  onClick,
  variant = "default",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline";
}) {
  const tone =
    variant === "default"
      ? "bg-black text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      : "border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("rounded-lg px-3 py-1 text-xs transition", tone)}
    >
      {children}
    </button>
  );
}
