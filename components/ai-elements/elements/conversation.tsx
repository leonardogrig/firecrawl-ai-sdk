'use client';

import { ReactNode, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export function Conversation({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex h-full flex-col overflow-hidden", className)}>{children}</div>;
}

export function ConversationContent({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 scroll-smooth">
      <div className="mx-auto flex max-w-full flex-col gap-6">{children}</div>
    </div>
  );
}

export function ConversationScrollButton({
  className,
}: {
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.scrollIntoView({ block: "end" });
  });

  return <div ref={ref} className={cn("h-2", className)} />;
}
