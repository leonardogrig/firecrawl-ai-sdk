/**
 * Chat API Route
 *
 * Provides streaming AI chat capabilities with integrated web scraping and search tools.
 * Uses OpenAI GPT-4o-mini with Firecrawl for gathering web data.
 */

import { NextResponse } from "next/server";
import { streamText, tool, stepCountIs, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import FirecrawlApp from "@mendable/firecrawl-js";
import { z } from "zod";

// Initialize Firecrawl client if API key is available
const firecrawl = process.env.FIRECRAWL_API_KEY
  ? new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })
  : null;

/**
 * Web Scraping Tool
 * Fetches and converts a webpage to markdown format for AI analysis
 */
const scrapeWebsiteTool = tool({
  description:
    "Scrape a public webpage and return markdown content for analysis.",
  inputSchema: z.object({
    url: z.string().url().describe("The absolute URL to fetch"),
  }),
  execute: async ({ url }) => {
    if (!firecrawl) {
      return {
        url,
        title: "Firecrawl key missing",
        content: `FIRECRAWL_API_KEY is not configured. Unable to scrape ${url}.`,
      };
    }

    try {
      const data = (await firecrawl.scrape(url, {
        formats: ["markdown"],
      })) as FirecrawlScrapeResponse;
      const markdown = data.markdown ?? data.content ?? "";
      const title = data.metadata?.title ?? "";

      return {
        url,
        title: title || url,
        content: `# ${title || url}\n\n${markdown}`,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown Firecrawl error.";
      return {
        url,
        title: "Firecrawl scrape failed",
        content: `Scrape error: ${message}`,
      };
    }
  },
});

/**
 * Web Search Tool
 * Searches the web and returns multiple results with snippets and markdown content
 */
const searchWebTool = tool({
  description:
    "Search the web for recent information about a company or topic using Firecrawl's search API.",
  inputSchema: z.object({
    query: z.string().min(3).describe("The search query to run"),
    limit: z.number().int().min(1).max(10).default(5),
  }),
  execute: async ({ query, limit }) => {
    if (!firecrawl) {
      return {
        query,
        results: [],
        note: "FIRECRAWL_API_KEY is not configured. Unable to perform search.",
      };
    }

    try {
      const response = await firecrawl.search(query, {
        limit,
        scrapeOptions: {
          formats: ["markdown"],
        },
      });

      const webResults = (response.web || []) as FirecrawlSearchResultItem[];

      const results = webResults.map((item) => ({
        title: item.metadata?.title || item.title || item.url || "Untitled",
        url: item.url,
        snippet: item.markdown?.slice(0, 400) || item.description || "",
        publishedTime: item.metadata?.publishedTime,
      }));

      const summaryLines = results.map((result, index) => {
        const title = result.title ?? result.url ?? `Result ${index + 1}`;
        const url = result.url ? ` (${result.url})` : "";
        const snippet = result.snippet ? `\n> ${result.snippet}` : "";
        return `- ${title}${url}${snippet}`;
      });

      const summary = summaryLines.length
        ? `### Search results for "${query}"\n${summaryLines.join("\n")}`
        : `### Search results for "${query}"\n- No results found.`;

      return {
        query,
        count: results.length,
        results,
        content: summary,
        message:
          results.length === 0
            ? "No results returned from Firecrawl search"
            : undefined,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown Firecrawl error.";
      return {
        query,
        results: [],
        error: message,
      };
    }
  },
});

type FirecrawlScrapeResponse = {
  url?: string;
  markdown?: string;
  content?: string;
  metadata?: {
    title?: string;
  };
};

type FirecrawlSearchResultItem = {
  url: string;
  title?: string;
  markdown?: string;
  description?: string;
  metadata?: {
    title?: string;
    publishedTime?: string;
  };
};

type ChatRequest = {
  messages?: unknown[];
};

export const dynamic = "force-dynamic";

/**
 * POST /api/chat
 * Handles chat requests and streams AI responses with tool calling capabilities
 */
export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Set OPENAI_API_KEY to enable the chat." },
      { status: 400 },
    );
  }

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const messages = convertToModelMessages(body.messages as Parameters<typeof convertToModelMessages>[0] ?? []);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: [
      "You are a helpful AI assistant with access to web scraping and search capabilities.",
      "You can help users research companies, topics, and gather information from the web using your tools.",
      "Only use tools when the user explicitly asks for information that requires web search or scraping.",
      "IMPORTANT: After using any tool, you MUST provide a clear, natural-language summary of the results to the user.",
      "Never just call a tool and stop - always follow up with an analysis or summary.",
      "Format your responses using proper Markdown syntax:",
      "- Use **bold** for emphasis",
      "- Use ## for section headers",
      "- Use - or * for unordered lists",
      "- Use numbered lists (1., 2., etc.) for ordered items",
      "- Use `code` for technical terms",
      "Keep your responses concise and helpful.",
    ].join("\n"),
    messages,
    tools: {
      scrapeWebsite: scrapeWebsiteTool,
      searchWeb: searchWebTool,
    },
    toolChoice: "auto",
    stopWhen: stepCountIs(5),
    maxOutputTokens: 1500,
  });

  return result.toUIMessageStreamResponse();
}
