'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { cn } from "@/lib/utils";

const stateLabels: Record<string, string> = {
  "input-streaming": "Pending",
  "approval-requested": "Awaiting approval",
  "approval-responded": "Approval response",
  "input-available": "Running",
  "output-available": "Completed",
  "output-error": "Error",
  "output-denied": "Denied",
};

export function Tool({
  children,
  defaultOpen = false,
  state,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  state?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const context = useMemo<ToolContextValue>(
    () => ({ open, setOpen }),
    [open],
  );

  const isRunning = state === "input-available" || state === "input-streaming";

  return (
    <ToolContext.Provider value={context}>
      <div className={cn(
        "rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
        isRunning && "animate-pulse ring-2 ring-blue-500/50"
      )}>
        {children}
      </div>
    </ToolContext.Provider>
  );
}

export function ToolHeader({
  state,
  type,
  title,
}: {
  state: string;
  type: string;
  title?: string;
}) {
  const ctx = useToolContext();
  const label = stateLabels[state] ?? state;
  return (
    <button
      type="button"
      onClick={() => ctx.setOpen((prev) => !prev)}
      className="flex w-full items-center justify-between gap-3 rounded-t-xl bg-zinc-100 px-4 py-3 text-left text-sm font-semibold text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
    >
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {title ?? type}
        </span>
        <span>{label}</span>
      </div>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{ctx.open ? "−" : "+"}</span>
    </button>
  );
}

export function ToolContent({ children }: { children: ReactNode }) {
  const ctx = useToolContext();
  if (!ctx.open) return null;
  return (
    <div className="flex flex-col gap-3 px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
      {children}
    </div>
  );
}

export function ToolInput({ input }: { input: unknown }) {
  if (!input) return null;
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
      <pre className="whitespace-pre-wrap break-words">{JSON.stringify(input, null, 2)}</pre>
    </div>
  );
}

export function ToolOutput({
  output,
  errorText,
}: {
  output?: ReactNode;
  errorText?: string;
}) {
  if (!output && !errorText) return null;
  return (
    <div
      className={cn(
        "rounded-lg border p-3 text-xs overflow-hidden",
        errorText
          ? "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
          : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300",
      )}
    >
      <div className="break-words overflow-wrap-anywhere">
        {errorText ? <p className="break-words">{errorText}</p> : output}
      </div>
    </div>
  );
}

type ToolContextValue = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const ToolContext = createContext<ToolContextValue | null>(null);

function useToolContext(): ToolContextValue {
  const ctx = useContext(ToolContext);
  if (!ctx) {
    throw new Error("Tool components must be used within <Tool>");
  }
  return ctx;
}
