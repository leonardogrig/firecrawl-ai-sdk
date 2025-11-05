# Firecrawl AI SDK - AI-Powered Research Assistant

An AI-powered research assistant that combines web scraping, search capabilities, and intelligent analysis using Firecrawl and OpenAI's GPT-4.

## Features

- **AI-Powered Chat Interface**: Interactive chat powered by OpenAI GPT-4o-mini
- **Web Scraping**: Automatically scrape web pages for detailed information using Firecrawl
- **Web Search**: Search the web for relevant information across multiple sources
- **Real-time Streaming**: See AI responses stream in real-time
- **Dark Mode**: Built-in dark mode support with persistent theme preference
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## Prerequisites

- Node.js 18+ installed
- OpenAI API key
- Firecrawl API key (optional, but recommended for full functionality)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd firecrawl-ai-sdk
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```bash
OPENAI_API_KEY=your-openai-api-key-here
FIRECRAWL_API_KEY=your-firecrawl-api-key-here
```

**Important:** Never commit API keys to version control. The `.env.local` file is ignored by git for security.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Example Queries

- "Give me a quick company briefing for firecrawl.dev"
- "What should I know before emailing a prospect at vercel.com?"
- "Summarize the latest product launch from openai.com"
- "Who are the target customers for notion.so?"

The assistant will automatically decide when to:
- Scrape specific web pages for detailed information
- Search the web for broader research
- Provide analysis and summaries based on the gathered data

## Project Structure

```
firecrawl-ai-sdk/
├── app/
│   ├── api/chat/
│   │   └── route.ts          # API endpoint with AI tools
│   ├── page.tsx               # Main chat interface
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/
│   └── ai-elements/
│       └── elements/          # Reusable UI components
├── lib/
│   └── utils.ts               # Utility functions
└── public/                    # Static assets
```

## API Tools

### scrapeWebsite
Scrapes a public webpage and returns markdown content for analysis.

**Input:** URL to scrape
**Output:** Markdown content with title and structured data

### searchWeb
Searches the web using Firecrawl's search API and returns up to 10 results.

**Input:** Search query
**Output:** List of results with titles, URLs, snippets, and markdown content

## Technology Stack

- **Framework:** Next.js 16 with App Router
- **UI:** React 19, Tailwind CSS 4
- **AI:** OpenAI GPT-4o-mini via Vercel AI SDK
- **Web Scraping:** Firecrawl API
- **Styling:** Tailwind CSS with dark mode support
- **Icons:** Lucide React

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `FIRECRAWL_API_KEY` | Optional | Your Firecrawl API key for web scraping/search |

## Security Notes

- Never commit `.env` or `.env.local` files to version control
- Rotate API keys immediately if accidentally exposed
- The app validates API key presence before making requests
- All API calls are made server-side to protect credentials

## License

This project is provided as-is for educational and commercial use.

## Support

For issues and questions, please refer to the [COOKBOOK.md](./COOKBOOK.md) file for additional setup details.
