This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## LLM configuration

The AI chat mode now supports two ways to choose an LLM:

- Built-in Gemini configuration from `.env`
- Your own OpenAI-compatible or Anthropic-compatible endpoint from the AI chat settings panel

AI chat uploads are also supported for:

- PDF files
- Word documents (`.doc`, `.docx`)
- Plain text files (`.txt`)
- Images

The search API can use Google Custom Search, Bing Custom Search, or DuckDuckGo search results, based on env configuration.

```bash
CUSTOM_SEARCH_PRIORITY=google

GOOGLE_API_KEY=
GOOGLE_SEARCH_CX=

BING_SEARCH_API_KEY=
BING_CUSTOM_CONFIG_ID=

DUCKDUCKGO_SEARCH_BASE_URL=https://html.duckduckgo.com/html/
```

Set `CUSTOM_SEARCH_PRIORITY=bing`, `google`, or `duckduckgo` to prefer that provider. If the preferred provider is missing its required env vars, the app falls back to another configured provider, then to DuckDuckGo, then to mock results.
Bing and DuckDuckGo results are exposed as internal `https://advocatehub.org/go/...` links in the UI and redirect immediately to the real target URL when opened.

Optional environment variables for a custom provider:

```bash
CUSTOM_LLM_PROVIDER=auto
CUSTOM_LLM_URL=
CUSTOM_LLM_API_KEY=
CUSTOM_LLM_MODEL=
CUSTOM_LLM_SYSTEM_PROMPT=
CUSTOM_LLM_TEMPERATURE=0.7
CUSTOM_LLM_MAX_TOKENS=2048
CUSTOM_LLM_ANTHROPIC_VERSION=2023-06-01
CUSTOM_LLM_SITE_URL=
CUSTOM_LLM_APP_NAME=AdvocateHub
```

`CUSTOM_LLM_PROVIDER` can be `auto`, `openai`, `openrouter`, or `anthropic`.

Examples of compatible endpoints include:

- OpenAI
- OpenRouter
- Groq
- Ollama
- LM Studio
- Anthropic Claude

If you enable the custom endpoint in the UI, the app will use that for chat; otherwise it keeps using Gemini with Google Search grounding. The search summary route also uses the same env-based custom provider config, so Claude / Anthropic can power both AI chat and search summaries.

For OpenRouter, use:

```bash
CUSTOM_LLM_PROVIDER=openrouter
CUSTOM_LLM_URL=https://openrouter.ai/api/v1
CUSTOM_LLM_API_KEY=
CUSTOM_LLM_MODEL=openai/gpt-4.1-mini
CUSTOM_LLM_SITE_URL=https://advocatehub.org
CUSTOM_LLM_APP_NAME=AdvocateHub
```

OpenRouter uses the OpenAI-style API path, and the app now also sends the optional `HTTP-Referer` and `X-Title` headers when `CUSTOM_LLM_PROVIDER=openrouter`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
