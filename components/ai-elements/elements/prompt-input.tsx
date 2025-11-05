'use client';

import { FormEvent, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PromptInputMessage = {
  text: string;
  files?: File[];
};

type PromptInputProps = {
  children: ReactNode;
  onSubmit?: (message: PromptInputMessage) => void;
  globalDrop?: boolean;
  multiple?: boolean;
};

export function PromptInput({ children, onSubmit }: PromptInputProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const textArea = form.elements.namedItem("prompt-text") as
      | HTMLTextAreaElement
      | null;
    const text = textArea?.value ?? "";
    const files: File[] = [];

    onSubmit?.({ text, files });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      {children}
    </form>
  );
}

export function PromptInputHeader({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

export function PromptInputAttachments({
  children,
}: {
  children: (attachment: File) => ReactNode;
}) {
  void children;
  return null;
}

export function PromptInputBody({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

export function PromptInputTextarea({
  value,
  onChange,
  name = "prompt-text",
  onKeyDown,
}: {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  name?: string;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      rows={3}
      className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/20"
      placeholder="Ask something..."
    />
  );
}

export function PromptInputFooter({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-between gap-2">{children}</div>;
}

export function PromptInputSubmit({
  disabled,
  status,
}: {
  disabled?: boolean;
  status: "submitted" | "streaming" | "ready" | "error";
}) {
  const loading = status === "submitted" || status === "streaming";
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:disabled:bg-zinc-700/60"
    >
      {loading ? "Sending…" : "Send"}
    </button>
  );
}
