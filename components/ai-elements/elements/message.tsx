'use client';

import Image from "next/image";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Message({
  from,
  children,
}: {
  from: 'user' | 'assistant';
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex w-full gap-3',
        from === 'assistant' ? 'justify-start' : 'justify-end',
      )}
    >
      {children}
    </div>
  );
}

export function MessageAvatar({
  src,
  name,
}: {
  src?: string;
  name?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? 'avatar'}
        width={40}
        height={40}
        className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
      />
    );
  }

  return (
    <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-800 text-xs uppercase text-white dark:border-zinc-700 dark:bg-zinc-200 dark:text-zinc-900">
      {name?.[0] ?? '?'}
    </div>
  );
}

export function MessageContent({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[80%] rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
      {children}
    </div>
  );
}
