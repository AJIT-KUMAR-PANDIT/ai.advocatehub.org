# AdvocateHub Documentation

Welcome to the AdvocateHub documentation. This documentation covers everything about the application.

## Quick Links

- [Getting Started](README.md) - Application overview and setup
- [API Reference](API.md) - Search and AI API endpoints
- [Components](COMPONENTS.md) - UI component documentation

## Table of Contents

### Overview
- [README](README.md) - Full application overview
- [Tech Stack](README.md#tech-stack) - Technologies used
- [Features](README.md#features) - Application features
- [Project Structure](README.md#project-structure) - File organization

### API
- [Search API](API.md#search-api) - Main search endpoint
- [AI Summary API](API.md#ai-summary-api) - Summary generation
- [AI Chat API](API.md#ai-chat-api) - Chat endpoint
- [Embed API](API.md#embed-api) - URL metadata extraction

### Components
- [Home Components](COMPONENTS.md#home-components) - Header, Footer, SearchBar
- [Search Components](COMPONENTS.md#search-components) - Results, filters, videos
- [AI Mode Components](COMPONENTS.md#ai-mode-components) - Chat UI
- [Styling](COMPONENTS.md#styling-classes) - CSS classes and themes

## Getting Started

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

## Search Types

| Type | Description |
|------|-------------|
| `all` | All web results |
| `web` | Web pages only |
| `pdf` | PDF documents |
| `docx` | Word documents |
| `docs` | All document types |
| `images` | Image results |
| `videos` | Video results |
| `audio` | Audio results |
| `news` | News articles |

## Environment Variables

Optional configuration:

```env
GOOGLE_SEARCH_API_KEY=your_key
GOOGLE_SEARCH_CX=your_cx
BING_SEARCH_API_KEY=your_key
BING_CUSTOM_CONFIG_ID=your_id
GEMINI_API_KEY=your_key
```

## Support

For issues or questions, please open an issue on GitHub.
