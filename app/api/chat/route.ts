/**
 * Chat API Route
 *
 * Provides streaming AI chat capabilities with integrated web scraping and search tools.
 * Uses OpenAI GPT-4o-mini with Firecrawl for gathering web data.
 */

import { NextResponse } from "next/server";
import { Experimental_Agent as Agent, tool, stepCountIs, validateUIMessages, Output } from "ai";
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
 * Supports advanced Firecrawl parameters for temporal, location-based, and category filtering
 */
const searchWebTool = tool({
  description:
    "Search the web for information using Firecrawl's advanced search API. " +
    "Supports time-based filtering (recent results), location-based search, " +
    "category filtering (github, research, pdf), and source types (web, news, images).",
  inputSchema: z.object({
    query: z.string().min(3).describe("The search query to run"),
    limit: z.number().int().min(1).max(10).default(5).describe("Number of results to return (1-10)"),
    tbs: z.string().optional().describe(
      "Time-based search filter. Options: " +
      "'qdr:h' (past hour), 'qdr:d' (past day), 'qdr:w' (past week), 'qdr:m' (past month), 'qdr:y' (past year), " +
      "or custom date range like 'cdr:1,cd_min:12/1/2024,cd_max:12/31/2024'. " +
      "Use this when user asks for 'new', 'recent', 'latest' information."
    ),
    location: z.string().optional().describe(
      "Location for geo-targeted search results (e.g., 'Germany', 'Brazil', 'United States'). " +
      "Use when user mentions a specific location or asks for local results."
    ),
    categories: z.array(z.enum(["github", "research", "pdf"])).optional().describe(
      "Filter by specific categories: " +
      "'github' for GitHub repos/code, 'research' for academic papers, 'pdf' for PDF documents. " +
      "Can combine multiple categories."
    ),
    sources: z.array(z.enum(["web", "news", "images"])).optional().describe(
      "Type of results: 'web' (standard), 'news' (news articles), 'images' (image search). " +
      "Defaults to ['web'] if not specified."
    ),
  }),
  execute: async ({ query, limit, tbs, location, categories, sources }) => {
    if (!firecrawl) {
      return {
        query,
        limit,
        parameters: { tbs, location, categories, sources },
        results: [],
        note: "FIRECRAWL_API_KEY is not configured. Unable to perform search.",
      };
    }

    try {
      const searchOptions: {
        limit: number;
        scrapeOptions: { formats: ("markdown" | "html" | "rawHtml" | "content" | "links" | "screenshot" | "screenshot@fullPage")[] };
        tbs?: string;
        location?: string;
        categories?: ("github" | "research" | "pdf")[];
        sources?: ("web" | "news" | "images")[];
      } = {
        limit,
        scrapeOptions: {
          formats: ["markdown"],
        },
      };

      // Add optional parameters if provided
      if (tbs) searchOptions.tbs = tbs;
      if (location) searchOptions.location = location;
      if (categories && categories.length > 0) searchOptions.categories = categories;
      if (sources && sources.length > 0) searchOptions.sources = sources;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await firecrawl.search(query, searchOptions as any);

      const webResults = (response.web || []) as FirecrawlSearchResultItem[];

      const results = webResults.map((item) => ({
        title: item.metadata?.title || item.title || item.url || "Untitled",
        url: item.url,
        snippet: item.markdown?.slice(0, 400) || item.description || "",
        publishedTime: item.metadata?.publishedTime,
        category: (item as { category?: string }).category, // GitHub, research, etc.
      }));

      const summaryLines = results.map((result, index) => {
        const title = result.title ?? result.url ?? `Result ${index + 1}`;
        const url = result.url ? ` (${result.url})` : "";
        const snippet = result.snippet ? `\n> ${result.snippet}` : "";
        const category = result.category ? ` [${result.category}]` : "";
        const published = result.publishedTime ? ` (Published: ${result.publishedTime})` : "";
        return `- ${title}${category}${published}${url}${snippet}`;
      });

      const summary = summaryLines.length
        ? `### Search results for "${query}"\n${summaryLines.join("\n")}`
        : `### Search results for "${query}"\n- No results found.`;

      return {
        query,
        limit,
        parameters: {
          tbs: tbs || "none",
          location: location || "global",
          categories: categories || [],
          sources: sources || ["web"],
        },
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
        limit,
        parameters: { tbs, location, categories, sources },
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

/**
 * Generic Scout Response Schema
 * Flexible enough to handle any type of query
 */
const scoutResponseSchema = z.object({
  taskCompleted: z.boolean().describe(
    "Whether the task was fully completed with satisfactory findings. " +
    "CRITICAL: If this is false, findings array MUST be empty. " +
    "Only set to true when you have verified findings to report."
  ),
  taskStatus: z.enum(["completed", "partial", "not_found", "insufficient_data"]).describe(
    "completed: Found what user wanted with all details (taskCompleted MUST be true) | " +
    "partial: Found something but missing key details (taskCompleted MUST be false, findings MUST be empty) | " +
    "not_found: Searched but found nothing relevant (taskCompleted MUST be false, findings MUST be empty) | " +
    "insufficient_data: Found mentions but couldn't verify specifics (taskCompleted MUST be false, findings MUST be empty)"
  ),
  message: z.string().describe("Natural language response to the user explaining what was found or not found"),
  findings: z.array(z.object({
    name: z.string().describe("Name of the entity found (restaurant, event, product, etc.)"),
    type: z.string().describe("Type of entity: restaurant, event, product, service, announcement, etc."),
    launchDate: z.string().nullable().describe("Date when it launched/opened/became available. ISO format (YYYY-MM-DD) or natural language like 'October 2024'. Null if not applicable or unknown."),
    details: z.record(z.any()).describe("Flexible object with relevant details. Examples: location, description, price, status, features, etc."),
    confidence: z.enum(["high", "medium", "low"]).describe(
      "high: Confirmed from multiple sources or official source | " +
      "medium: Found in reliable source but not cross-verified | " +
      "low: Found mention but couldn't confirm details"
    ),
    sources: z.array(z.object({
      title: z.string(),
      url: z.string(),
      publishedDate: z.string().nullable().describe("When the source was published (if available)")
    }))
  })).describe(
    "Array of verified findings. " +
    "CRITICAL RULE: This array MUST be empty [] if taskCompleted is false. " +
    "Only populate this array when taskCompleted is true and you have fully verified findings."
  ),
  searchStrategies: z.array(z.string()).describe("List of search strategies/queries attempted"),
  nextSteps: z.string().nullable().describe("What to try next time if task not completed. Null if completed.")
});

/**
 * Chat Agent
 * Agent instance configured with web scraping and search tools
 */
const chatAgent = new Agent({
  model: openai("gpt-5-mini"),
  experimental_output: Output.object({
    schema: scoutResponseSchema,
  }),
  system: [
    `# SCOUT AGENT - Persistent Information Monitor`,
    `Current date: ${new Date().toISOString().split('T')[0]} (${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })})`,
    "",
    "## Who You Are",
    "You are a SCOUT AGENT that runs periodically to find information for users.",
    "You are a persistent researcher - if you don't find something now, you'll run again later.",
    "",
    "## Core Principles",
    "- **Quality over quantity** - Better to find 1 verified item than 5 unverified ones",
    "- **Verify everything** - Use scraping to confirm what snippets suggest",
    "- **Be thorough** - Don't just skim, investigate properly",
    "- **Be honest** - It's OK to not find something",
    "- You have up to 10 steps - use them wisely, but don't feel obligated to use all of them",
    "- **IMPORTANT**: Your response will be automatically formatted as structured JSON output. Do NOT wrap it in markdown code fences or add any extra formatting.",
    "",
    "## Understanding User Intent",
    "",
    "Analyze each query to identify:",
    "",
    "**1. What they're looking for:**",
    "- Physical entities (businesses, venues, products)",
    "- Information (announcements, news, updates)",
    "- Events (launches, openings, releases)",
    "",
    "**2. Key qualifiers:**",
    "- **Temporal**: 'new', 'recent', 'latest', 'upcoming', 'just opened'",
    "- **Location**: Geographic references, cities, countries",
    "- **Type/Category**: Specific categories or types",
    "- **Quality**: 'best', 'top-rated', comparison requests",
    "",
    "**3. Search strategy based on intent:**",
    "",
    "- **MONITORING** ('when available', 'notify me'): Search for announcements, pre-sales, release dates",
    "- **TEMPORAL** ('new', 'recent', 'latest'): Use time filters, verify dates are recent",
    "- **DISCOVERY** ('find', 'search for'): Comprehensive search for current options",
    "- **RESEARCH** ('best', 'compare'): Search reviews, rankings, analysis",
    "",
    "## Available Tools",
    "",
    "### searchWeb",
    "Powerful search with advanced filtering:",
    "",
    "**Parameters:**",
    "- `query`: Your search query",
    "- `limit`: Results to return (1-10, default 5)",
    "- `tbs`: Time-based filtering",
    "  - 'qdr:d' = past day",
    "  - 'qdr:w' = past week",
    "  - 'qdr:m' = past month",
    "  - 'qdr:y' = past year",
    "  - Custom: 'cdr:1,cd_min:MM/DD/YYYY,cd_max:MM/DD/YYYY'",
    "- `location`: Geographic targeting (e.g., 'Germany', 'Brazil')",
    "- `categories`: ['github'], ['research'], ['pdf'], or combinations",
    "- `sources`: ['web'], ['news'], ['images']",
    "",
    "**Usage tips:**",
    "- Use `tbs` for temporal queries ('new', 'recent', 'latest')",
    "- Use `location` when user mentions a place",
    "- Use `sources: ['news']` for announcements or recent events",
    "- Results include `publishedTime` - use this to verify recency",
    "",
    "### scrapeWebsite",
    "Fetches full markdown content from a URL:",
    "",
    "**When to use:**",
    "- Search snippets are incomplete or vague",
    "- You need specific details (dates, prices, exact information)",
    "- Verifying information from search results",
    "",
    "**Critical:** Don't rely solely on 400-character snippets. If a result looks promising, scrape it.",
    "",
    "## Search Strategy",
    "",
    "**Be adaptive** - You don't need to follow a rigid phase structure. Use your judgment:",
    "",
    "1. **Start broad** - Try different query variations with appropriate filters",
    "2. **Investigate promising leads** - Scrape URLs that look relevant",
    "3. **Verify findings** - Cross-reference information across sources",
    "4. **Stop when satisfied** - If you've found what you need with high confidence, finish early",
    "",
    "**Efficiency tips:**",
    "- Vary your queries (synonyms, different phrasings, local language)",
    "- Use filters intelligently (temporal filters for 'new', location for geographic queries)",
    "- Scrape official sources and reliable sites first",
    "- If finding nothing, try broader or adjacent searches",
    "",
    "## Information Extraction",
    "",
    "**Match extraction to user intent:**",
    "",
    "- **Temporal queries** ('new', 'recent'): Dates are CRITICAL - extract specific launch/opening dates",
    "- **Monitoring queries** ('when available'): Look for announcement dates or 'not announced yet'",
    "- **Discovery queries** ('find'): Dates helpful but not required - focus on current availability",
    "- **Research queries** ('best'): Focus on ratings, reviews, comparisons",
    "",
    "**Verification standards:**",
    "- **High confidence**: Official source OR 2+ independent sources",
    "- **Medium confidence**: One reliable source, not cross-verified",
    "- **Low confidence**: Only found in snippets, couldn't verify",
    "",
    "## Response Format",
    "",
    "You MUST respond using the structured JSON schema.",
    "",
    "### Critical Rules:",
    "",
    "**⚠️ MANDATORY: taskCompleted and findings relationship**",
    "- IF `taskCompleted = false` → `findings` MUST BE EMPTY `[]`",
    "- IF `taskCompleted = true` → `findings` MUST CONTAIN verified items",
    "- NO EXCEPTIONS",
    "",
    "### Field Guidelines:",
    "",
    "**taskCompleted** (boolean):",
    "- `true`: Found what user wanted with sufficient verified details",
    "- `false`: Didn't find it, found partial info, or couldn't verify",
    "",
    "**taskStatus** (enum):",
    "- `completed`: Found satisfactory results (taskCompleted = true, findings populated)",
    "- `partial`: Found something but missing critical info (taskCompleted = false, findings = [])",
    "- `not_found`: Searched but found nothing (taskCompleted = false, findings = [])",
    "- `insufficient_data`: Found mentions but couldn't verify (taskCompleted = false, findings = [])",
    "",
    "**message** (string):",
    "Natural language explanation of what you found or didn't find.",
    "",
    "**findings** (array):",
    "Only populate when `taskCompleted = true`. Each finding:",
    "- `name`: Actual name of entity",
    "- `type`: What it is (restaurant, event, product, etc.)",
    "- `launchDate`: Date in 'YYYY-MM-DD' or natural language, or null",
    "- `details`: Flexible object with relevant info (location, description, price, etc.)",
    "- `confidence`: high/medium/low",
    "- `sources`: Array of source objects with title, url, publishedDate",
    "",
    "**searchStrategies** (array):",
    "List queries/approaches tried with parameters used.",
    "Example: `'searchWeb: query=\"X\" location=Y tbs=qdr:m'`",
    "",
    "**nextSteps** (string | null):",
    "What to try next if taskCompleted = false, otherwise null.",
    "",
    "## Final Validation",
    "",
    "Before responding, CHECK:",
    "1. Is `taskCompleted = false`? → Then `findings` MUST be `[]`",
    "2. Is `taskCompleted = true`? → Then `findings` MUST have ≥1 item",
    "3. Do NOT include unverified findings in the array",
    "4. Use `message` field to explain what you found but couldn't verify",
  ].join("\n"),
  tools: {
    scrapeWebsite: scrapeWebsiteTool,
    searchWeb: searchWebTool,
  },
  stopWhen: stepCountIs(10),
  toolChoice: "auto",
  prepareStep: async ({ stepNumber }) => {
    if (stepNumber === 9) {
      return {
        system: `You're approaching your step limit (step ${stepNumber + 1} of 10). Consider wrapping up your search and preparing your response.`,
      };
    }
    return {};
  },
});

export const dynamic = "force-dynamic";

/**
 * POST /api/chat
 * Handles chat requests using the Agent class with streaming for UI
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

  const messages = body.messages ?? [];

  // Validate UI messages for the agent
  const validatedMessages = await validateUIMessages({ messages });

  console.log('\n=== Starting Agent Execution ===');
  console.log('Message count:', validatedMessages.length);

  // Log the last user message for debugging
  const lastUserMessage = validatedMessages
    .filter(m => m.role === 'user')
    .pop();
  if (lastUserMessage) {
    console.log('Last user message:', JSON.stringify(lastUserMessage, null, 2));
  }
  console.log('================================\n');

  // Create a streaming response with logging
  const response = chatAgent.respond({
    messages: validatedMessages as Parameters<typeof chatAgent.respond>[0]['messages'],
  });

  // Clone the response to log it while still streaming to the client
  const [logStream, clientStream] = response.body!.tee();

  // Log the stream in the background
  (async () => {
    try {
      const reader = logStream.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            if (line.startsWith('0:')) {
              const data = JSON.parse(line.slice(2));

              if (data.type === 'tool-call') {
                console.log('\n🔧 Tool Call:');
                console.log('  Tool:', data.toolName);
                console.log('  Args:', JSON.stringify(data.args, null, 2));
              } else if (data.type === 'tool-result') {
                console.log('\n✅ Tool Result:');
                console.log('  Tool:', data.toolName);
                console.log('  Result:', JSON.stringify(data.result, null, 2));
              } else if (data.type === 'finish') {
                console.log('\n=== Agent Finished ===');
                console.log('Reason:', data.finishReason);
                console.log('======================\n');
              }
            }
          } catch {
            // Ignore JSON parse errors for non-JSON lines
          }
        }
      }
    } catch (err) {
      console.error('Logging error:', err);
    }
  })();

  // Return the client stream
  return new Response(clientStream, {
    headers: response.headers,
  });
}
