'use client';

import { ReactNode, useRef, useEffect } from "react";

import { cn } from "@/lib/utils";

export function Suggestions({ children, className }: { children: ReactNode; className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div ref={scrollRef} className={cn('flex gap-2 overflow-x-auto pb-2 scrollbar-hide', className)}>
      {children}
    </div>
  );
}

export function Suggestion({
  suggestion,
  onClick,
}: {
  suggestion: string;
  onClick: (value: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(suggestion)}
      className="shrink-0 rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 whitespace-nowrap"
    >
      {suggestion}
    </button>
  );
}
