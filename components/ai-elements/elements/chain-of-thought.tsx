'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ChainOfThoughtContextValue = {
  open: boolean;
  toggle: () => void;
};

const ChainOfThoughtContext = createContext<ChainOfThoughtContextValue | null>(
  null,
);

export function ChainOfThought({
  children,
  defaultOpen = false,
  className,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const value = useMemo<ChainOfThoughtContextValue>(
    () => ({
      open,
      toggle: () => setOpen((prev) => !prev),
    }),
    [open],
  );

  return (
    <ChainOfThoughtContext.Provider value={value}>
      <div
        className={cn(
          "rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
          className,
        )}
      >
        {children}
      </div>
    </ChainOfThoughtContext.Provider>
  );
}

export function ChainOfThoughtHeader({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const ctx = useContext(ChainOfThoughtContext);
  if (!ctx) {
    throw new Error("ChainOfThoughtHeader must be used inside ChainOfThought");
  }

  return (
    <button
      type="button"
      onClick={ctx.toggle}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-t-2xl px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50",
        className,
      )}
    >
      <span>{children ?? "Chain of Thought"}</span>
      {ctx.open ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </button>
  );
}

export function ChainOfThoughtContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(ChainOfThoughtContext);
  if (!ctx) {
    throw new Error("ChainOfThoughtContent must be used inside ChainOfThought");
  }

  if (!ctx.open) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-4 px-5 pb-5 pt-2", className)}>
      {children}
    </div>
  );
}

export type ChainOfThoughtStatus = "pending" | "active" | "complete";

const statusStyles: Record<
  ChainOfThoughtStatus,
  { dot: string; border: string; label: string }
> = {
  pending: {
    dot: "bg-zinc-300 dark:bg-zinc-700",
    border: "border-dashed border-zinc-300 dark:border-zinc-700",
    label: "text-zinc-500 dark:text-zinc-400",
  },
  active: {
    dot: "bg-blue-500",
    border: "border-blue-500",
    label: "text-blue-600 dark:text-blue-300",
  },
  complete: {
    dot: "bg-emerald-500",
    border: "border-emerald-500",
    label: "text-emerald-600 dark:text-emerald-300",
  },
};

export function ChainOfThoughtStep({
  icon: Icon,
  label,
  status,
  children,
}: {
  icon?: LucideIcon;
  label: ReactNode;
  status: ChainOfThoughtStatus;
  children?: ReactNode;
}) {
  const style = statusStyles[status];

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm transition",
        style.border,
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-white",
            style.dot,
          )}
        >
          {Icon ? <Icon className="h-4 w-4" /> : null}
        </span>
        <p className={cn("font-medium leading-5", style.label)}>{label}</p>
      </div>
      {children ? (
        <div className="mt-3 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function ChainOfThoughtSearchResults({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col gap-2 text-xs text-zinc-500", className)}>
      {children}
    </ul>
  );
}

export function ChainOfThoughtSearchResult({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"li">) {
  return (
    <li
      className={cn(
        "rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium dark:border-zinc-800",
        className,
      )}
      {...props}
    >
      {children}
    </li>
  );
}

export function ChainOfThoughtImage({
  caption,
  children,
}: {
  caption?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        {children}
      </div>
      {caption ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{caption}</p>
      ) : null}
    </div>
  );
}
