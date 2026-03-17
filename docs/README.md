# AdvocateHub Search Application

## Overview

AdvocateHub is a minimal search engine with AI-powered summaries, built for searching webpages, PDFs, DOCX, images, videos, audio, and more. It features a clean, elegant design with warm colors and glassmorphism effects.

## Features

- **Web Search**: Live search results from Bing, Google, and DuckDuckGo
- **AI Summaries**: Get AI-generated summaries of search results
- **File Type Filters**: Search specifically for PDFs, DOCX, images, videos, audio
- **Video Player**: Inline video playback with playlist view (like Bing Videos)
- **Image Gallery**: Grid view of image results
- **Infinite Scroll**: Load more results as you scroll
- **AI Workspace**: Dedicated mode for AI-powered legal research
- **Glassmorphism UI**: Modern, elegant design with smooth animations

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **AI**: Google Gemini for summaries
- **Search**: Bing HTML, Google HTML, DuckDuckGo scraping (no API keys required)
- **Fonts**: Geist Sans, Geist Mono

## Project Structure

```
/app
├── page.js                    # Home page with search
├── AImode/page.js            # AI Workspace page
├── search/page.js            # Search results page
├── globals.css               # Global styles and theme
├── components/
│   ├── Home/
│   │   ├── Header.js         # Main navigation header
│   │   ├── Footer.js         # Footer component
│   │   ├── Logo.js           # Logo component
│   │   ├── SearchBar.js      # Search input component
│   │   └── ModeToggle.js    # Search/AI mode toggle
│   ├── Search/
│   │   ├── SearchResultsClient.js  # Main search results
│   │   ├── SearchHeader.js         # Search page header
│   │   ├── SearchFiltersBar.js     # Filter options
│   │   ├── SearchSummaryCard.js    # AI summary display
│   │   ├── ResultItem.js           # Text result item
│   │   ├── ResultImageItem.js       # Image result item
│   │   ├── ResultVideoItem.js       # Video result item
│   │   ├── VideoPlaylist.js         # Video playlist player
│   │   └── ResultSkeleton.js        # Loading skeleton
│   └── AImode/
│       ├── ChatMessage.js          # AI chat message
│       ├── AttachmentChip.js        # File attachment chip
│       └── SourceCard.js           # Source reference card
├── api/
│   ├── search/route.js       # Search API endpoint
│   ├── search/summary/route.js  # AI summary API
│   ├── ai/route.js           # AI chat API
│   └── embed/route.js       # URL embed API
/lib
├── searchConfig.js          # Search provider configuration
├── searchFilters.js         # Search filter utilities
├── searchRedirect.js        # Redirect handling
└── searchSystemSnapshot.js # System status

```

## Pages

### Home Page (`/`)
- Logo display with animation
- Search bar with mode toggle
- Quick filters (PDF, DOCX, Images, Videos, Audio, News, Official)
- Feature cards highlighting key features
- Footer with links

### Search Results (`/search`)
- Search query header
- Filter bar (type, site restrict, date restrict)
- AI summary card (when available)
- Results display:
  - Text results: List view with title, snippet, URL
  - Image results: Grid gallery with lazy loading
  - Video results: Playlist view with inline player
- Infinite scroll for loading more results
- "Visit" button for external links

### AI Mode (`/AImode`)
- Chat interface for AI-powered search
- File attachment support (PDF, DOCX, images)
- Source citation cards
- Chat history

## API Endpoints

### GET /api/search
Search the web for results.

**Parameters:**
- `q` (required): Search query
- `type`: Result type (all, web, pdf, docx, docs, images, videos, audio, slides, sheets, text, archives, news)
- `fileType`: File type filter (pdf, doc, docx, ppt, xls, txt, rtf)
- `siteRestrict`: Site filter (official, govonly, courts)
- `dateRestrict`: Date filter (d1, w1, m1, m3, m6, y1, y2, y5)
- `num`: Number of results (default 20, max 50)

**Response:**
```json
{
  "items": [
    {
      "title": "Result Title",
      "link": "https://example.com",
      "snippet": "Result description...",
      "formattedUrl": "example.com"
    }
  ],
  "meta": {
    "provider": "bing_html",
    "totalResults": 20,
    "formattedTotalResults": "20",
    "searchTime": 0.5
  }
}
```

### POST /api/search/summary
Generate AI summary of search results.

**Body:**
```json
{
  "query": "search term",
  "results": [...]
}
```

### POST /api/ai
AI chat endpoint for AImode.

### GET /api/embed
URL embed metadata extraction.

## Search Providers

The application uses multiple search providers in priority order:

1. **Bing HTML** (no API key) - Primary web search
2. **Google HTML** (no API key) - Fallback search
3. **DuckDuckGo** (no API key) - Additional results
4. **Bing Images** - Image search
5. **Bing Videos** - Video search

All providers work without API keys using HTML scraping.

## Configuration

Environment variables (optional):
- `GOOGLE_SEARCH_API_KEY` - Google Custom Search API key
- `GOOGLE_SEARCH_CX` - Google Custom Search Engine ID
- `BING_SEARCH_API_KEY` - Bing Search API key
- `BING_CUSTOM_CONFIG_ID` - Bing Custom Config ID
- `GEMINI_API_KEY` - Google Gemini API key for AI

## Design System

### Colors
- Background: `#fff7ef` (warm cream)
- Foreground: `#2d1b12` (dark brown)
- Accent: `#ff6e41` (vibrant orange)
- Warm: `#ffbe4a` (warm yellow)
- Muted: `#7b5b42` (muted brown)

### Components
- `.surface-panel` - Glassmorphism card
- `.surface-card` - Elevated card
- `.action-primary` - Primary button (orange gradient)
- `.action-secondary` - Secondary button
- `.section-kicker` - Section badge

### Animations
- `fade-in-up` - Staggered fade in animation
- `pulse-glow` - Accent dot glow
- `ambient-float` - Background floating effect

## Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## License

MIT
