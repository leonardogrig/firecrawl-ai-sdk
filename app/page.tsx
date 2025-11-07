'use client';

import React, { useCallback, useEffect, useState, type ReactNode } from "react";
import { useChat } from "@ai-sdk/react";
import type {
  DynamicToolUIPart,
  ToolUIPart,
  UIMessage,
  UIMessagePart,
} from "ai";
import { CheckIcon, XIcon, Moon, Sun } from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/elements/conversation";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/elements/message";
import {
  PromptInput,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/elements/reasoning";
import { Response } from "@/components/ai-elements/elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/elements/tool";
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@/components/ai-elements/elements/confirmation";
import { Suggestions, Suggestion } from "@/components/ai-elements/elements/suggestion";

const suggestions = [
  "Give me a quick company briefing for firecrawl.dev",
  "What should I know before emailing a prospect at vercel.com?",
  "Summarize the latest product launch from openai.com",
  "Who are the target customers for notion.so?",
];

const userAvatar = "https://avatar.vercel.sh/user";
const assistantAvatar = "https://avatar.vercel.sh/assistant";

const Example = () => {
  const [text, setText] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isInitialized = React.useRef(false);

  // Initialize theme from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

      if (shouldBeDark) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Handle theme toggle
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      if (newValue) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newValue;
    });
  }, []);

  const { messages, status, sendMessage, stop, error, setMessages } = useChat({
    // @ts-expect-error - api parameter is valid but types may be outdated
    api: "/api/chat",
  });

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const content = message.text.trim();
      if (!content) return;
      sendMessage({ text: content });
      setText("");
    },
    [sendMessage],
  );

  const handleSuggestionClick = useCallback(
    (value: string) => {
      sendMessage({ text: value });
    },
    [sendMessage],
  );

  const isStreaming = status === "streaming";

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-gray-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="flex-1 overflow-hidden flex items-center justify-center py-6">
        <div className="w-full max-w-4xl h-full flex flex-col px-4 sm:px-8">
          <Conversation className="flex-1">
            <ConversationContent>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">
                    Ask anything, Firecrawl will scrape it for you!
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  <ConversationScrollButton />
                </>
              )}
            </ConversationContent>
          </Conversation>

          <div className="shrink-0 grid gap-4">
          {messages.length === 0 && (
            <Suggestions>
              {suggestions.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  suggestion={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                />
              ))}
            </Suggestions>
          )}

          {error ? (
            <p className="px-2 text-sm text-red-500">
              {error.message}
            </p>
          ) : null}

          <div className="w-full">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputHeader>
              <PromptInputAttachments>{() => null}</PromptInputAttachments>
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea
                name="prompt-text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                    event.preventDefault();
                    if (text.trim() && !isStreaming) {
                      handleSubmit({ text: text.trim() });
                    }
                  }
                }}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setMessages([]);
                      setText("");
                    }}
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={() => stop()}
                    className="text-xs text-zinc-500 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-100"
                  >
                    Stop
                  </button>
                ) : null}
                <PromptInputSubmit
                  disabled={!text.trim() || isStreaming}
                  status={status}
                />
              </div>
            </PromptInputFooter>
          </PromptInput>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Example;

function ChatMessage({ message }: { message: UIMessage }) {
  const role = message.role === "assistant" ? "assistant" : "user";
  const textParts = (message.parts ?? []).filter(
    // @ts-expect-error - UIMessagePart type inference issue
    (part): part is Extract<UIMessagePart, { type: "text" }> => part.type === "text",
  );
  const reasoningParts = (message.parts ?? []).filter(
    // @ts-expect-error - UIMessagePart type inference issue
    (part): part is Extract<UIMessagePart, { type: "reasoning" }> =>
      part.type === "reasoning",
  );
  const toolCalls = extractToolCalls(message);

  const avatarSrc = role === "assistant" ? assistantAvatar : userAvatar;
  const displayName = role === "assistant" ? "Assistant" : "You";

  return (
    <Message from={role}>
      {role === "assistant" ? <MessageAvatar name={displayName} src={avatarSrc} /> : null}
      <MessageContent>
        <div className="flex flex-col gap-3">
          {reasoningParts.map((part, index) => (
            <Reasoning duration={part.text.length % 12} key={`${part.id}-reasoning-${index}`}>
              <ReasoningTrigger />
              <ReasoningContent>{part.text}</ReasoningContent>
            </Reasoning>
          ))}

          {toolCalls.map((tool) => (
            <Tool
              key={tool.id}
              state={tool.state}
              defaultOpen={
                tool.state === "output-available" ||
                tool.state === "output-error" ||
                tool.state === "output-denied"
              }
            >
              <ToolHeader
                state={tool.state}
                type={tool.type}
                title={tool.name}
              />
              <ToolContent>
                <ToolInput input={tool.input} />
                {tool.approval ? renderConfirmation(tool) : null}
                <ToolOutput errorText={tool.errorText} output={tool.output} />
              </ToolContent>
            </Tool>
          ))}

          {textParts.length ? (
            <Response>
              {(() => {
                const text = textParts.map((part) => part.text).join("");
                // Try to detect if this is a JSON response and format it
                try {
                  const parsed = JSON.parse(text);
                  // If it parses successfully and looks like our scout response schema
                  if (parsed && typeof parsed === 'object' && 'taskCompleted' in parsed) {
                    return '```json\n' + JSON.stringify(parsed, null, 2) + '\n```';
                  }
                } catch {
                  // Not JSON, return as-is
                }
                return text;
              })()}
            </Response>
          ) : null}
        </div>
      </MessageContent>
      {role === "user" ? <MessageAvatar name={displayName} src={avatarSrc} /> : null}
    </Message>
  );
}

type ToolCall = {
  id: string;
  name: string;
  type: string;
  state: string;
  input?: unknown;
  output?: ReactNode;
  errorText?: string;
  approval?: {
    id?: string;
    approved?: boolean;
    reason?: string;
    state?: string;
  };
};

function extractToolCalls(message: UIMessage): ToolCall[] {
  if (!message.parts) return [];

  return message.parts
    .filter(isToolPart)
    .map((part, index) => ({
      id: part.toolCallId ?? `${getToolName(part)}-${index}`,
      name: getToolName(part),
      type: part.type,
      state: (part as { state?: string }).state ?? "unknown",
      input: (part as { input?: unknown }).input,
      output: formatToolOutput((part as { output?: unknown }).output),
      errorText: (part as { errorText?: string }).errorText,
      approval: extractApproval(part),
    }));
}

function formatToolOutput(value: unknown): ReactNode {
  if (typeof value === "string") {
    return <pre className="whitespace-pre-wrap wrap-break-word">{value}</pre>;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "results" in value &&
    Array.isArray((value as { results: unknown }).results)
  ) {
    const payload = value as {
      query?: string;
      results: Array<{
        title?: string;
        url?: string;
        snippet?: string;
        publishedTime?: string;
      }>;
      message?: string;
      count?: number;
    };

    if (payload.results.length === 0) {
      return (
        <div className="text-xs text-zinc-500">
          {payload.message ?? "No search results returned."}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 text-xs text-zinc-600 dark:text-zinc-300">
        {payload.results.map((item, index) => (
          <div key={item.url ?? `${payload.query}-${index}`} className="flex flex-col gap-1">
            {item.title ? (
              <span className="font-medium text-zinc-700 dark:text-zinc-100">
                {item.title}
              </span>
            ) : null}
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline underline-offset-4 break-all"
              >
                {item.url}
              </a>
            ) : null}
            {item.snippet ? <p className="wrap-break-word">{item.snippet}</p> : null}
            {item.publishedTime ? (
              <span className="text-[11px] uppercase tracking-wide text-zinc-400">
                {item.publishedTime}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    );
  }
  if (!value) return undefined;
  return (
    <pre className="whitespace-pre-wrap wrap-break-word">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

type ToolPart = ToolUIPart | (DynamicToolUIPart & {
  approval?: {
    id?: string;
    approved?: boolean;
    reason?: string;
    state?: string;
  };
});

function extractApproval(part: ToolPart) {
  if ("approval" in part && part.approval) {
    return {
      id: part.approval.id,
      approved: part.approval.approved,
      reason: part.approval.reason,
      state: part.approval.state,
    };
  }
  return undefined;
}

function renderConfirmation(tool: ToolCall) {
  const approval = tool.approval;
  if (!approval) return null;

  const state = approval.state ?? tool.state;

  return (
    <Confirmation
      state={state}
      approval={{
        id: approval.id ?? tool.id,
        approved: approval.approved,
        reason: approval.reason,
      }}
    >
      <ConfirmationTitle>
        <ConfirmationRequest>
          {tool.name} requested approval.
        </ConfirmationRequest>
        <ConfirmationAccepted>
          <CheckIcon className="h-3 w-3" />
          <span>Approved</span>
        </ConfirmationAccepted>
        <ConfirmationRejected>
          <XIcon className="h-3 w-3" />
          <span>
            {approval.reason ? `Rejected: ${approval.reason}` : "Rejected"}
          </span>
        </ConfirmationRejected>
      </ConfirmationTitle>
      {state === "approval-requested" ? (
        <ConfirmationActions>
          <ConfirmationAction variant="outline">Reject</ConfirmationAction>
          <ConfirmationAction>Accept</ConfirmationAction>
        </ConfirmationActions>
      ) : null}
    </Confirmation>
  );
}

// @ts-expect-error - UIMessagePart type inference issue
function isToolPart(part: UIMessagePart): part is ToolPart {
  return (
    typeof part === "object" &&
    part !== null &&
    "type" in part &&
    typeof (part as { type?: unknown }).type === "string" &&
    (part.type.startsWith("tool-") || part.type === "dynamic-tool")
  );
}

function getToolName(part: ToolPart) {
  if (part.type === "dynamic-tool" && "toolName" in part && part.toolName) {
    return part.toolName;
  }
  return part.type.replace(/^tool-/, "");
}
