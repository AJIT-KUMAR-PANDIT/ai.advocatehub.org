# API Documentation

## Search API

### GET /api/search

Main search endpoint that returns results from multiple providers.

**Endpoint:** `GET /api/search`

**Query Parameters:**

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| q | string | Yes | Search query | - |
| type | string | No | Result type (all, web, pdf, docx, docs, images, videos, audio, slides, sheets, text, archives, news) | all |
| fileType | string | No | File type filter (pdf, doc, docx, ppt, xls, txt, rtf) | - |
| siteRestrict | string | No | Site filter (official, govonly, courts) | - |
| dateRestrict | string | No | Date filter (d1, w1, m1, m3, m6, y1, y2, y5) | - |
| num | number | No | Number of results (max 50) | 20 |

**Example Request:**
```
GET /api/search?q=supreme court india&type=all&num=20
```

**Success Response (200):**
```json
{
  "items": [
    {
      "title": "Supreme Court of India",
      "link": "https://main.sci.gov.in/",
      "snippet": "The Supreme Court of India is the highest judicial forum...",
      "formattedUrl": "main.sci.gov.in"
    }
  ],
  "meta": {
    "query": "supreme court india",
    "resultType": "all",
    "provider": "bing_html",
    "totalResults": 20,
    "formattedTotalResults": "20",
    "searchTime": 0.45,
    "isMock": false
  }
}
```

**Error Response (400):**
```json
{
  "error": "Query parameter 'q' is required"
}
```

## Search Result Types

### Web Search (type=all or type=web)
Returns standard web search results with title, URL, and snippet.

### PDF Search (type=pdf)
Returns PDF documents matching the query.

### DOCX Search (type=docx)
Returns DOCX documents matching the query.

### Image Search (type=images)
Returns image results with thumbnail URLs.

**Response includes:**
```json
{
  "items": [
    {
      "title": "Image Title",
      "link": "https://example.com/image.jpg",
      "formattedUrl": "example.com",
      "image": {
        "thumbnailLink": "https://example.com/thumb.jpg",
        "url": "https://example.com/image.jpg"
      }
    }
  ]
}
```

### Video Search (type=videos)
Returns video results from YouTube, Vimeo, Dailymotion.

**Response includes:**
```json
{
  "items": [
    {
      "title": "Video Title",
      "link": "https://youtube.com/watch?v=xxx",
      "formattedUrl": "youtube.com",
      "snippet": "Video description",
      "duration": "10:30",
      "thumbnail": "https://img.youtube.com/vi/xxx/mqdefault.jpg",
      "video": true
    }
  ]
}
```

## AI Summary API

### POST /api/search/summary

Generates an AI summary of search results.

**Endpoint:** `POST /api/search/summary`

**Request Body:**
```json
{
  "query": "search term",
  "results": [
    {
      "title": "Result Title",
      "link": "https://example.com",
      "snippet": "Result description"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "summary": "AI generated summary of the search results...",
  "sources": [
    {
      "title": "Source Title",
      "url": "https://example.com"
    }
  ]
}
```

## AI Chat API

### POST /api/ai

AI-powered chat for deeper research.

**Endpoint:** `POST /api/ai`

**Request Body:**
```json
{
  "message": "Your question here",
  "history": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ],
  "attachments": [
    {
      "type": "file",
      "name": "document.pdf",
      "content": "base64 encoded content..."
    }
  ]
}
```

**Response:**
```json
{
  "response": "AI response...",
  "sources": [
    {"title": "Source", "url": "https://example.com"}
  ]
}
```

## Embed API

### GET /api/embed?url={url}

Extracts metadata from a URL.

**Endpoint:** `GET /api/embed?url=https://example.com`

**Response:**
```json
{
  "title": "Page Title",
  "description": "Page description",
  "image": "https://example.com/image.jpg",
  "siteName": "Example",
  "url": "https://example.com"
}
```
