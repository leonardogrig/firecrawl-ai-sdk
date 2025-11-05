'use client';

import { useState, type ReactNode } from "react";


export function Reasoning({
  children,
  duration,
}: {
  children: ReactNode;
  duration: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-3 dark:border-amber-500/60 dark:bg-amber-500/10">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-200"
      >
        Reasoning ({duration}s) {open ? '−' : '+'}
      </button>
      {open ? <ReasoningContent>{children}</ReasoningContent> : null}
    </div>
  );
}

export function ReasoningTrigger() {
  return null;
}

export function ReasoningContent({ children }: { children: ReactNode }) {
  return <div className="mt-2 text-xs text-amber-900 dark:text-amber-100">{children}</div>;
}
