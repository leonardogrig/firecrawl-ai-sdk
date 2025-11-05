'use client';

import { ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export function Response({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  // Convert children to string if it's a single string
  const content = typeof children === "string" ? children : children?.toString() ?? "";

  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none [&>*:last-child]:mb-0 ${className ?? ""}`}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Customize headings
          h1: ({ children, ...props }) => (
            <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-xl font-bold mb-3 mt-6 text-zinc-900 dark:text-zinc-100" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-lg font-semibold mb-2 mt-4 text-zinc-900 dark:text-zinc-100" {...props}>
              {children}
            </h3>
          ),
          // Customize paragraphs
          p: ({ children, ...props }) => (
            <p className="mb-4 leading-7 text-zinc-700 dark:text-zinc-300" {...props}>
              {children}
            </p>
          ),
          // Customize lists
          ul: ({ children, ...props }) => (
            <ul className="mb-4 ml-6 list-disc space-y-2 text-zinc-700 dark:text-zinc-300" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="mb-4 ml-6 list-decimal space-y-2 text-zinc-700 dark:text-zinc-300" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="leading-7" {...props}>
              {children}
            </li>
          ),
          // Customize code blocks
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <code className={`${className} block bg-zinc-900 dark:bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto`} {...props}>
                {children}
              </code>
            ) : (
              <code className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-1.5 py-0.5 rounded font-mono" {...props}>
                {children}
              </code>
            );
          },
          // Customize links to open in new tab
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              {...props}
            >
              {children}
            </a>
          ),
          // Customize strong/bold
          strong: ({ children, ...props }) => (
            <strong className="font-bold text-zinc-900 dark:text-zinc-100" {...props}>
              {children}
            </strong>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
