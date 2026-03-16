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
- Your own OpenAI-compatible endpoint from the AI chat settings panel

AI chat uploads are also supported for:

- PDF files
- Word documents (`.doc`, `.docx`)
- Plain text files (`.txt`)
- Images

Optional environment variables for a custom provider:

```bash
CUSTOM_LLM_URL=
CUSTOM_LLM_API_KEY=
CUSTOM_LLM_MODEL=
CUSTOM_LLM_SYSTEM_PROMPT=
CUSTOM_LLM_TEMPERATURE=0.7
CUSTOM_LLM_MAX_TOKENS=2048
```

Examples of compatible endpoints include OpenAI, OpenRouter, Groq, Ollama, and LM Studio. If you enable the custom endpoint in the UI, the app will use that for chat; otherwise it keeps using Gemini with Google Search grounding.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
